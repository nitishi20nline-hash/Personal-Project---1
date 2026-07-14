export interface APQPProject {
  id: string;
  name: string;
  partNumber: string;
  customer: string;
  status: 'Planning' | 'Design' | 'ProcessDev' | 'Validation' | 'Production' | 'Completed';
  progress: number; // 0 - 100
  launchDate: string;
  createdAt: string;
}

export interface FMEAItem {
  id: string;
  projectId: string;
  processStep: string;
  potentialFailureMode: string;
  potentialFailureEffects: string;
  severity: number; // 1 - 10
  potentialCauses: string;
  occurrence: number; // 1 - 10;
  currentControls: string;
  detection: number; // 1 - 10
  rpn: number; // severity * occurrence * detection
  recommendedActions: string;
  actionResponsibility: string;
  actionStatus: 'Open' | 'In Progress' | 'Completed';
}

export interface PPAPElement {
  id: string;
  projectId: string;
  elementCode: string;
  elementName: string;
  status: 'Not Started' | 'In Progress' | 'Under Review' | 'Approved' | 'Rejected';
  submittedBy: string;
  submittedAt: string;
  comments: string;
}

export interface CAPALog {
  id: string;
  title: string;
  projectId?: string;
  defectDescription: string;
  source: 'Customer Complaint' | 'Internal Audit' | 'Production Inspection' | 'Supplier Quality';
  status: 'Draft' | 'Investigation' | 'ActionPlan' | 'Verification' | 'Closed';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  containmentAction: string;
  rootCauseAnalysis: {
    method: '5Whys' | 'Fishbone';
    whys?: string[]; // index 0-4 for 5 Whys
    fishbone?: {
      manpower?: string;
      machinery?: string;
      materials?: string;
      methods?: string;
      measurement?: string;
      environment?: string;
    };
  };
  correctiveAction: string;
  preventiveAction: string;
  owner: string;
  createdAt: string;
  closedAt?: string;
}
