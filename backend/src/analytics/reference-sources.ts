export type ReferenceSource = {
  title: string;
  description: string;
  url: string;
  kind: 'survey' | 'report' | 'annual_report' | 'baseline' | 'questionnaire' | 'other';
};

export const referenceSources: ReferenceSource[] = [
  {
    title: 'Semantic Scholar Community Needs PDF',
    description: 'Reference PDF supplied for needs-assessment extraction.',
    url: 'https://pdfs.semanticscholar.org/074e/19b9d946e99ea6ec9978346eb7a6cf6d1312.pdf',
    kind: 'report',
  },
  {
    title: 'India Human Development Survey Household Questionnaire',
    description: 'Large-scale national household questionnaire used by NGOs and researchers.',
    url: 'https://ihds.umd.edu/system/files/2020-03/ihds1isq.pdf',
    kind: 'questionnaire',
  },
  {
    title: 'Unnat Bharat Abhiyan Village Survey Form',
    description: 'Government and NGO collaboration village-level needs form.',
    url: 'https://unnatbharatabhiyan.gov.in/public/uploads/documents/UBA_Village_Survey_Form.pdf',
    kind: 'survey',
  },
  {
    title: 'Sabuj Sangha Need Assessment Report',
    description: 'West Bengal needs assessment covering health, nutrition, and disaster.',
    url: 'https://sabujsangha.org/wp-content/uploads/2022/11/Need-Assessment-Report-Sabuj-Sangha.pdf',
    kind: 'report',
  },
  {
    title: 'Stonestep Community Need Assessment Cum Baseline Survey',
    description: 'Household survey and baseline methodology from a disaster-prone context.',
    url: 'https://www.adpc.net/cic/wp-content/uploads/2022/04/16-Stonestep_Need-Assessment-Basline-Survey-Report_Stonestep_ADPC.pdf',
    kind: 'baseline',
  },
  {
    title: 'PMA India Rajasthan Household Questionnaire',
    description: 'Family planning and health-needs household questionnaire.',
    url: 'https://pma.ipums.org/pma/resources/questionnaires/hhf/PMA2020_INP1_Rajasthan_HQFQ_Household_Questionnaire_v1.0_10Jun2021.pdf',
    kind: 'questionnaire',
  },
  {
    title: 'Household Consumption Expenditure Survey Appendix',
    description: 'NSO/NSSO national consumption and household needs questionnaire appendix.',
    url: 'https://www.mospi.gov.in/sites/default/files/publication_reports/HCES-22-23/AppendixA.pdf',
    kind: 'questionnaire',
  },
  {
    title: 'Bihar Rural Livelihoods Project Household Survey',
    description: 'World Bank-linked rural livelihoods household survey.',
    url: 'https://microdata.worldbank.org/index.php/catalog/5912/download/62652',
    kind: 'survey',
  },
  {
    title: 'ICRISAT Village Level Studies Household Questionnaire',
    description: 'Semi-arid India household questionnaire across multiple states.',
    url: 'https://vdsa.icrisat.org/Include/Questionaire/siq/Questionaires_SAT%20India_2001%20-%202004_Survey%20Questionnaire%202001-04.pdf',
    kind: 'questionnaire',
  },
  {
    title: 'Gateway CAA Community Needs Assessment Questionnaire',
    description: 'Short practical community needs assessment form.',
    url: 'https://gatewaycaa.org/wp-content/uploads/2024/07/Gateway-CNA-2024-2025.pdf',
    kind: 'questionnaire',
  },
  {
    title: 'Butterflies NGO Annual Report 2022-23',
    description: 'Delhi-focused child rights NGO annual report.',
    url: 'https://butterfliesngo.org/wp-content/uploads/2024/01/Annual-Report-2022-23-V6-Spread.pdf',
    kind: 'annual_report',
  },
  {
    title: 'Ashadeep NGO Annual Report',
    description: 'NGO annual report reference for program and impact areas.',
    url: 'https://1ngo.in/media/ashadeepango/Annual%20Report.pdf',
    kind: 'annual_report',
  },
  {
    title: 'Hand in Hand India Annual Reports',
    description: 'Annual report listing page for livelihood-focused NGO reporting across multiple states.',
    url: 'https://hihindia.org/resources/annual-reports',
    kind: 'annual_report',
  },
  {
    title: 'IndiVillage Foundation Annual Impact Report 2023-24',
    description: 'Livelihood and impact-focused annual report.',
    url: 'http://www.indivillagefoundation.org/wp-content/uploads/2024/05/Annual-Impact-Report-2023-24.pdf',
    kind: 'annual_report',
  },
  {
    title: 'UNICEF India Annual Report 2024',
    description: 'UNICEF India annual report reference.',
    url: 'https://open.unicef.org/download-pdf?country-name=India&year=2024',
    kind: 'annual_report',
  },
  {
    title: 'Oxfam India Disaster Risk Reduction Baseline',
    description: 'Disaster risk reduction baseline reference.',
    url: 'https://www.oxfamindia.org/sites/default/files/PN-OIN-HRDRR-01-DRR-Baseline-2012-EN.pdf',
    kind: 'baseline',
  },
  {
    title: 'NIUA Knowledge Needs Assessment',
    description: 'Urban local bodies knowledge-needs assessment.',
    url: 'https://niua.in/intranet/sites/default/files/2259.pdf',
    kind: 'report',
  },
  {
    title: 'Brightpoint Community Needs Assessment',
    description: 'Structured community needs assessment example.',
    url: 'https://www.incap.org/assets/docs/NeedsAssessment/Brightpoint_2024_CNA_Final.pdf',
    kind: 'report',
  },
];
