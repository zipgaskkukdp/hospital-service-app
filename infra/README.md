# AI Care Infra

Infra-only Terraform for the AI-based hybrid infant pre-questionnaire and
hospital recommendation platform.

This folder creates AWS infrastructure only. It does not modify application
code, Kubernetes manifests, GitHub Actions workflows, `docker-compose.yml`, or
root environment examples.

## Existing Service Network

The Service VPC and its public, private app, private data subnets, route tables,
and internet gateway were created in the AWS Console. Terraform references them
through data sources in the `existing-network` module and does not recreate
them.

## Existing On-Prem Network

The current dev example also references an already-created On-Prem VPC:

- VPC: `vpc-0a53924e1ccaeb2e2`
- CIDR: `172.16.0.0/16`
- Public subnet: `subnet-04b1cf699c6c52520` in `ap-northeast-2a`
- Private subnet: `subnet-0652c89ea58554194` in `ap-northeast-2a`
- Route table IDs: to be filled later when provided

Use `create_onprem_network=false` to keep referencing these existing resources.
When route table IDs are provided, set
`existing_onprem_public_route_table_id` and
`existing_onprem_private_route_table_id`; if the same route table is associated
to both subnets, use the same ID for both variables.

## Created by Terraform

- On-Prem Role VPC, public/private subnets, IGW, and route tables when
  `create_onprem_network=true`; the current dev example references the existing
  On-Prem VPC/subnets with `create_onprem_network=false`
- Security groups
- strongSwan EC2 with EIP
- FastAPI placeholder EC2
- On-Prem PostgreSQL placeholder EC2
- Virtual Private Gateway, Customer Gateway, Site-to-Site VPN, and static routes
- RDS PostgreSQL with AWS-managed master password
- EKS cluster, managed node group, OIDC provider, and add-ons
- ECR repositories
- SQS triage queue and DLQ
- S3 reports bucket and CloudFront distribution
- CloudWatch log groups
- Backend IRSA role and policies
- AI processor placeholder IAM role and policy

## Not Created by Terraform

- Existing Service VPC, subnets, route tables, or IGW
- Existing On-Prem VPC/subnets when `create_onprem_network=false`
- NAT Gateway
- ALB
- AWS Load Balancer Controller
- Backend Kubernetes deployments
- Frontend deployment
- Running onprem-api service
- Lambda function or event source mapping
- Bedrock real invocation code
- Kubernetes Secret
- GitHub Actions workflow
- ArgoCD
- AWS access keys

## Run

```bash
cd infra/terraform/environments/dev
cp tfvars.env.example tfvars.env.local
vi tfvars.env.local
source tfvars.env.local
aws sts get-caller-identity
terraform init -backend=false
terraform plan -out=tfplan
terraform apply tfplan
```

## Secret Principles

- Do not commit `terraform.tfvars`, `tfvars.env.local`, `.env`, state files, or keys.
- Do not put JWT secrets, field encryption keys, database passwords,
  `DATABASE_URL`, API keys, AWS secret keys, or VPN PSKs in Terraform code.
- RDS master password is managed by AWS Secrets Manager.
- SQS triage messages should contain metadata only.
- Bedrock inputs should be redacted or tokenized before invocation.

## Cost Notes

EKS, worker EC2, RDS Multi-AZ, VPN, CloudFront, S3, and any existing console
NAT Gateway can incur cost. Review `terraform plan` carefully before apply.

## Next Steps

- Build and push application images.
- Deploy backend or MSA workloads to EKS.
- Deploy the onprem-api service on the placeholder EC2.
- Configure strongSwan with real tunnel settings.
- Enable Lambda/Bedrock real mode when implementation is ready.
- Add CI/CD explicitly when the deployment path is finalized.
