import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MatchingService {
  constructor(private readonly prisma: PrismaService) {}

  async suggest(taskId: string) {
    const task = await this.loadTask(taskId);
    const volunteers = await this.loadVolunteers();
    return volunteers
      .map((volunteer) => this.scoreVolunteer(task, volunteer))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }

  async batchPlan(taskIds: string[], volunteerIds?: string[]) {
    const tasks = await this.prisma.task.findMany({
      where: { id: { in: taskIds } },
      include: { location: true, skills: { include: { skill: true } }, urgencyScores: { orderBy: { calculatedAt: 'desc' }, take: 1 } },
    });
    const volunteers = await this.loadVolunteers(volunteerIds);
    const slots = tasks.flatMap((task) =>
      Array.from({ length: task.requiredVolunteers }, (_v, index) => ({ task, slot: index + 1 })),
    );

    const candidates = slots.flatMap((slot) =>
      volunteers.map((volunteer) => ({ ...this.scoreVolunteer(slot.task, volunteer), taskId: slot.task.id, slot: slot.slot })),
    );
    const usedVolunteers = new Set<string>();
    const usedSlots = new Set<string>();
    const assignments = candidates
      .sort((a, b) => b.score - a.score)
      .filter((candidate) => {
        const slotKey = `${candidate.taskId}:${candidate.slot}`;
        if (usedVolunteers.has(candidate.volunteer.id) || usedSlots.has(slotKey)) return false;
        usedVolunteers.add(candidate.volunteer.id);
        usedSlots.add(slotKey);
        return true;
      });

    return { assignments, unfilledSlots: slots.length - assignments.length };
  }

  private async loadTask(taskId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { location: true, skills: { include: { skill: true } }, urgencyScores: { orderBy: { calculatedAt: 'desc' }, take: 1 } },
    });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  private loadVolunteers(volunteerIds?: string[]) {
    return this.prisma.volunteer.findMany({
      where: volunteerIds?.length ? { id: { in: volunteerIds } } : undefined,
      include: {
        user: true,
        homeLocation: true,
        skills: { include: { skill: true } },
        languages: { include: { language: true } },
        availability: true,
        assignments: { where: { status: { in: ['APPROVED', 'IN_PROGRESS'] } } },
      },
    });
  }

  private scoreVolunteer(task: Awaited<ReturnType<MatchingService['loadTask']>>, volunteer: Awaited<ReturnType<MatchingService['loadVolunteers']>>[number]) {
    const taskSkills = new Set(task.skills.map((item) => item.skill.name));
    const volunteerSkills = new Set(volunteer.skills.map((item) => item.skill.name));
    const skillMatches = [...taskSkills].filter((skill) => volunteerSkills.has(skill));
    const skillScore = taskSkills.size ? (skillMatches.length / taskSkills.size) * 30 : 18;
    const languageScore = volunteer.languages.some((item) => item.language.code === 'ta' || item.language.code === 'en') ? 15 : 5;
    const distanceScore = this.distanceScore(task.location, volunteer.homeLocation);
    const availabilityScore = volunteer.availability.some((item) => item.active) ? 15 : 5;
    const performanceScore = volunteer.performanceScore * 15;
    const fatiguePenalty = Math.min(20, volunteer.assignments.length * 6 + volunteer.fatigueScore / 5);
    const preferenceScore = volunteer.taskPreferences.includes(task.category) ? 10 : 3;
    const score = Math.max(0, Math.min(100, skillScore + languageScore + distanceScore + availabilityScore + performanceScore + preferenceScore - fatiguePenalty));

    return {
      volunteer: {
        id: volunteer.id,
        userId: volunteer.userId,
        name: volunteer.user.fullName,
        workloadScore: volunteer.workloadScore,
        fatigueScore: volunteer.fatigueScore,
      },
      score: Math.round(score * 10) / 10,
      explanation: {
        skillMatches,
        distance: distanceScore >= 15 ? 'near task area' : 'location may require travel',
        availability: availabilityScore >= 15 ? 'available in configured windows' : 'limited availability',
        language: languageScore >= 15 ? 'supports Tamil or English' : 'language compatibility uncertain',
        performance: `performance score ${volunteer.performanceScore}`,
        fatigue: `${fatiguePenalty} point workload/fatigue penalty`,
        preference: preferenceScore >= 10 ? 'task category is preferred' : 'task category is not a stated preference',
      },
    };
  }

  private distanceScore(taskLocation?: { latitude: number | null; longitude: number | null } | null, volunteerLocation?: { latitude: number | null; longitude: number | null } | null) {
    if (!taskLocation?.latitude || !taskLocation.longitude || !volunteerLocation?.latitude || !volunteerLocation.longitude) return 10;
    const km = this.haversine(taskLocation.latitude, taskLocation.longitude, volunteerLocation.latitude, volunteerLocation.longitude);
    if (km <= 5) return 20;
    if (km <= 15) return 15;
    if (km <= 40) return 8;
    return 2;
  }

  private haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const radius = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
}
