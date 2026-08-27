# Security and Code Quality

At **Bryntum**, we place a strong emphasis on building software that is both secure and maintainable. To achieve
this, we continuously monitor the security and overall quality of the codebase
using [SonarCloud](https://sonarcloud.io).

Our process integrates automated checks directly into the development workflow, ensuring that vulnerabilities and bugs
are detected and addressed as early as possible. By embedding these controls into every stage of
development, we maintain high standards and reduce the risk of security regressions over time.

<p style="text-align: center;">
    <img src="https://sonarcloud.io/api/project_badges/quality_gate?project=bryntum_bryntum-suite&token=f834523c003d63689c20e399484457046debce5d" alt="Quality gate" style="height:80px;" />
</p>

## Security Scans

- **Static Analysis**: Every change to the codebase is automatically analyzed using SonarCloud. The analysis detects
  common coding mistakes, potential vulnerabilities, code smells, and other quality issues. This allows developers to
  quickly identify areas that could lead to bugs or security concerns before they are merged.
- **Dependency Checks**: In addition to code analysis, our pipeline also performs regular checks on all dependencies.
  External libraries and packages are cross-checked against public vulnerability databases. If a dependency is found to
  be outdated or associated with a known CVE, it is flagged for immediate review and remediation. This process reduces
  the chance of introducing vulnerabilities through third-party code.

## Software Bill of Materials (SBOM)

Bryntum provides comprehensive Software Bill of Materials (SBOM) files with every release. These files list all
third-party dependencies bundled in our products, enabling automated vulnerability scanning and supply chain
security analysis.

We publish SBOM files in two industry-standard formats:

* ***CycloneDX 1.5**: `bryntum-sbom.cdx.json`
* ***SPDX 2.3**: `bryntum-sbom.spdx.json`

Each SBOM file is cryptographically signed with a detached RSA-SHA256 signature to ensure integrity:

* `bryntum-sbom.cdx.json.sig` - Signature for CycloneDX file
* `bryntum-sbom.spdx.json.sig` - Signature for SPDX file
* `bryntum-sbom-public.pem` - Public key for verification

These files are included in the root directory of each product distribution and can be used with automated
security scanning tools to identify known vulnerabilities in dependencies.

## Contribution Policy

All code contributions are subjected to the same rigorous process. Pull requests trigger automated pipelines that run
static analysis and dependency checks. If a contribution fails to meet the defined quality
gates, the merge is automatically blocked until the reported issues are resolved. This mechanism guarantees that only
secure and maintainable code is introduced into the main branch.

We maintain a strong focus on transparency when it comes to security-related issues. Any identified vulnerabilities or
weaknesses are logged, prioritized, and tracked until resolution. Security concerns always take precedence, and patches
are delivered as quickly as possible to protect our users. This structured approach helps us ensure that the Bryntum
Code base remains reliable, secure, and trustworthy for all production environments.

## Security Contacts

The security of our users and customers is of the highest importance to us. If you believe you have discovered a
vulnerability, weakness, or any behavior that could pose a security risk, we strongly encourage you to reach out to us
using the email address below. Reports are treated with confidentiality, and our team will investigate, reproduce, and 
remediate issues as quickly as possible.

Please contact us directly at:

- Email: [security@bryntum.com](mailto:security@bryntum.com)

We appreciate responsible disclosure and are committed to resolving any confirmed security issue promptly. By reporting
issues responsibly, you help us maintain the highest levels of trust and reliability in the Bryntum code base.



<p class="last-modified">Last modified on 2026-07-22 10:46:48</p>