# Infra-Only Apply Runbook

## A. Purpose

Create AWS infrastructure with Terraform before deploying application workloads.
This runbook covers the infra-only phase for the AI-based hybrid infant
questionnaire and hospital recommendation platform.

## B. Created by This Apply

- On-Prem Role VPC when `create_onprem_network=true`; the current dev example
  references the existing On-Prem VPC/subnets with `create_onprem_network=false`
- Security groups
- strongSwan, FastAPI placeholder, and On-Prem PostgreSQL placeholder EC2
- AWS Site-to-Site VPN resources and routes
- RDS PostgreSQL
- EKS cluster, managed node group, OIDC provider, and add-ons
- ECR repositories
- SQS triage queue and DLQ
- S3 reports bucket
- CloudFront distribution
- CloudWatch log groups
- IAM roles and IRSA policy

## Existing On-Prem Values in Dev

- On-Prem VPC: `vpc-0a53924e1ccaeb2e2`
- CIDR: `172.16.0.0/16`
- Public subnet: `subnet-04b1cf699c6c52520`
- Private subnet: `subnet-0652c89ea58554194`
- Availability Zone: `ap-northeast-2a`
- On-Prem route table: `rtb-038788093fe3a6b25`
- On-Prem IGW: `igw-02cc153ccd9981c3f`

Known Service VPC route tables:

- Public route table: `rtb-0cf3c0a0cb31950de`
- Private app route table: `rtb-0b57d3c7408c20c8d`

The infra-only VPN route uses `rtb-0b57d3c7408c20c8d` for
`172.16.0.0/16 -> VGW`. The On-Prem public/private subnets currently share
`rtb-038788093fe3a6b25`.

## C. Not Created by This Apply

- Backend deployment
- Frontend deployment
- Running onprem-api service
- Lambda function
- Real Bedrock invocation logic
- Kubernetes Secret
- AWS Load Balancer Controller
- CI/CD resources when `enable_cicd=false`

## D. Execution Order

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

## E. Check in the Plan

- Existing Service VPC, subnets, IGW, and route tables are not created.
- On-Prem VPC is created only when `create_onprem_network=true`; with the
  current dev example, existing On-Prem VPC/subnets are referenced instead.
- NAT Gateway is not created.
- ALB is not created.
- Lambda function is not created when `create_ai_processor_lambda=false`.
- CI/CD resources are not created when `enable_cicd=false`.
- Unwanted `board-service` ECR or app resources are not created.

## F. Check After Apply

- EKS cluster exists.
- Managed node group exists.
- RDS is `available`.
- ECR repositories exist.
- SQS queue and DLQ exist.
- S3 bucket and CloudFront distribution exist.
- Three On-Prem EC2 instances exist.
- VPN Connection exists.
- VPN tunnels may remain down until strongSwan is configured with real tunnel settings.

## G. Cost Notes

- EKS cluster and worker nodes incur cost.
- RDS Multi-AZ incurs cost.
- EC2 instances incur cost.
- Site-to-Site VPN incurs cost.
- If a NAT Gateway already exists in the console, it may continue to incur cost,
  but this Terraform code does not create one.
- CloudFront and S3 incur usage-based cost.

## H. Destroy Notes

- `terraform destroy` removes only resources managed by this Terraform state.
- Existing console-created Service VPC, subnets, IGW, and route tables are not
  destroy targets.
- S3 bucket deletion can fail when objects remain in the bucket.
- RDS uses `skip_final_snapshot=true` for dev.
