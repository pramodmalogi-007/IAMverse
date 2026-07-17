export const iamProducts = [
  {
    id: "okta",
    name: "Okta / Auth0",
    description:
      "The industry leader in workforce SSO and Customer IAM (CIAM). Best for organizations with a heavy reliance on SaaS apps, needing rapid deployment, seamless developer experience, and modern cloud-native architectures.",
    bestFor: ["SSO", "CIAM", "B2B/B2C Identity", "SaaS Heavy"],
    logo: "Cloud",
    advantages: [
      "Extensive out-of-the-box integration catalog (OIN).",
      "Exceptional developer experience (Auth0) for custom apps.",
      "Cloud-native, highly available architecture.",
    ],
    disadvantages: [
      "Pricing can become prohibitive at massive scale.",
      "Less robust for deep legacy, on-prem infrastructure.",
      "Basic IGA capabilities require add-ons or separate products.",
    ],
  },
  {
    id: "entra",
    name: "Microsoft Entra ID",
    description:
      "Ideal for organizations heavily invested in the Microsoft 365 and Azure ecosystem. Provides excellent conditional access, identity protection, and seamless integration for Windows-centric environments.",
    bestFor: ["Microsoft Ecosystem", "Conditional Access", "Workforce Identity"],
    logo: "Shield",
    advantages: [
      "Often included in existing E3/E5 enterprise agreements (cost-effective).",
      "Deep integration with Windows, Office 365, and Azure.",
      "Powerful conditional access and device posture policies.",
    ],
    disadvantages: [
      "Steep learning curve for complex hybrid deployments.",
      "Can be rigid when integrating with non-Microsoft ecosystem tools.",
      "Customer IAM (B2C) offerings lag behind specialized competitors.",
    ],
  },
  {
    id: "sailpoint",
    name: "SailPoint",
    description:
      "The gold standard for Identity Governance and Administration (IGA). Best for large enterprises facing strict regulatory compliance, requiring deep access reviews, role mining, and automated provisioning.",
    bestFor: ["IGA", "Access Reviews", "Compliance", "Automated Provisioning"],
    logo: "FileText",
    advantages: [
      "Unmatched capabilities for access certification and SoD.",
      "AI/ML driven role mining and access recommendations.",
      "Extremely flexible for complex enterprise entitlements.",
    ],
    disadvantages: [
      "High implementation complexity and cost.",
      "Requires dedicated IGA engineering teams to maintain.",
      "Not an access management (SSO/MFA) solution; requires integration with Okta/Entra.",
    ],
  },
  {
    id: "cyberark",
    name: "CyberArk",
    description:
      "The premier solution for Privileged Access Management (PAM). Essential for organizations that need to secure admin accounts, vault credentials, implement zero standing privileges, and monitor privileged sessions.",
    bestFor: [
      "PAM",
      "Secrets Management",
      "Session Recording",
      "Zero Standing Privileges",
    ],
    logo: "Lock",
    advantages: [
      "Industry-leading credential vaulting and session isolation.",
      "Strong capabilities for DevOps and machine identity secrets.",
      "Comprehensive endpoint privilege management (EPM).",
    ],
    disadvantages: [
      "Can introduce significant friction for administrators.",
      "Complex architecture requires specialized expertise.",
      "High licensing costs.",
    ],
  },
  {
    id: "ping",
    name: "Ping Identity",
    description:
      "Excellent for complex, hybrid enterprise environments that still maintain significant on-premises infrastructure alongside cloud services. Offers high flexibility for legacy application integrations.",
    bestFor: ["Hybrid IAM", "Legacy Apps", "Complex Enterprise"],
    logo: "Server",
    advantages: [
      "Exceptional flexibility for complex on-prem/cloud hybrid setups.",
      "Strong support for legacy protocols (header-based auth, SAML, WS-Fed).",
      "Highly customizable policy engine.",
    ],
    disadvantages: [
      "Configuration and maintenance can be highly complex.",
      "Cloud-native SaaS offering is less mature than Okta.",
      "Smaller developer community for custom extensions.",
    ],
  },

  // NEW: Oracle
  {
    id: "oracle",
    name: "Oracle Identity Management / OCI IAM",
    description:
      "Best suited for enterprises already invested in Oracle applications and databases. Strong for large, regulated environments that need tight integration with Oracle middleware and on-prem workloads.",
    bestFor: ["Oracle Stack", "On-Prem + Cloud Hybrid", "Large Enterprise"],
    logo: "Database",
    advantages: [
      "Deep integration with Oracle applications, databases, and middleware.",
      "Mature on-prem and hybrid deployment options.",
      "Strong support for complex enterprise directory and RBAC models.",
    ],
    disadvantages: [
      "Implementation and operations can be complex and resource-intensive.",
      "Less friendly developer experience compared to modern cloud-native IAM.",
      "Best value mainly when an organization is already an Oracle customer.",
    ],
  },

  // NEW: Saviynt
  {
    id: "saviynt",
    name: "Saviynt",
    description:
      "A cloud-native platform that combines Identity Governance, cloud entitlement management, and application access controls. Designed for organizations wanting modern IGA plus strong cloud security.",
    bestFor: ["Cloud IGA", "Compliance", "Cloud Entitlements", "Zero Trust"],
    logo: "Layers",
    advantages: [
      "Strong IGA with good support for access reviews and SoD.",
      "Built-in analytics for cloud entitlements and risk scoring.",
      "Cloud-native architecture with good SaaS integrations.",
    ],
    disadvantages: [
      "Can be complex to configure for very nuanced policies.",
      "UI and workflows can feel heavy for smaller organizations.",
      "Often requires skilled partners for initial rollout.",
    ],
  },

  // NEW: IBM
  {
    id: "ibm",
    name: "IBM Security Verify (formerly IBM IAM)",
    description:
      "Enterprise-grade IAM platform with strong federation, access management, and governance capabilities, often used in complex, regulated environments with mainframe or legacy systems.",
    bestFor: ["Large Enterprise", "Legacy Integration", "Federation", "Compliance"],
    logo: "Globe",
    advantages: [
      "Rich feature set spanning SSO, MFA, federation, and governance.",
      "Good integration with legacy systems and mainframe environments.",
      "Backed by IBM’s broader security ecosystem and services.",
    ],
    disadvantages: [
      "Complex product stack with a steeper learning curve.",
      "May be heavyweight for small or mid-size organizations.",
      "Modern developer experience not as smooth as pure-play CIAM platforms.",
    ],
  },

  // Optional extra: OneLogin
  {
    id: "onelogin",
    name: "OneLogin (by One Identity)",
    description:
      "A solid SSO and access management solution for organizations looking for a simpler alternative to Okta with good directory integration and MFA.",
    bestFor: ["SSO", "MFA", "Mid-Market Organizations"],
    logo: "Key",
    advantages: [
      "Straightforward SSO and MFA setup for workforce users.",
      "Good integration with Active Directory and common SaaS apps.",
      "Often more cost-effective for mid-sized companies.",
    ],
    disadvantages: [
      "Smaller integration catalog compared to Okta.",
      "IGA and PAM capabilities are limited; usually need additional tools.",
      "Less focus on advanced CIAM features.",
    ],
  },

  // Optional extra: ForgeRock
  {
    id: "forgerock",
    name: "ForgeRock Identity Platform",
    description:
      "Powerful, flexible IAM platform favored by organizations that need highly customizable, large-scale consumer identity or complex, hybrid deployments.",
    bestFor: ["CIAM at Scale", "Highly Custom IAM", "Telecom/Financial Services"],
    logo: "Settings",
    advantages: [
      "Very flexible architecture for complex use cases.",
      "Strong capabilities for large-scale consumer identity.",
      "Good support for modern protocols and APIs.",
    ],
    disadvantages: [
      "Implementation typically requires specialized expertise.",
      "May be overkill for smaller or simpler environments.",
      "Total cost of ownership can be high.",
    ],
  },
];
