export interface DashboardData {
  metrics: any[];
  chartData: {
    tickets: {
      labels: string[];
      created: number[];
      solved: number[];
    };
    satisfaction: {
      positive: number;
      negative: number;
    };
    channel: {
      name: string;
      value: number;
    }[];
  };
}
