declare module "eth-phishing-detect/src/detector" {
  export interface PhishingCheckResult {
    result: boolean;
    type: string;
    name?: string;
    match?: string;
    version?: string | number;
  }

  export interface LegacyPhishingDetectorConfig {
    whitelist?: string[];
    blacklist?: string[];
    fuzzylist?: string[];
    tolerance?: number;
  }

  export default class PhishingDetector {
    constructor(config: LegacyPhishingDetectorConfig);
    check(domain: string): PhishingCheckResult;
  }
}
