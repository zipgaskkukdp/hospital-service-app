# Infra-Only Apply Runbook

## A. Purpose

Create AWS infrastructure with Terraform before deploying application workloads.
This runbook covers the infra-only phase for the AI-based hybrid infant
questionnaire and hospital recommendation platform.

## B. Created by This Apply

- On-Prem Role VPC
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
- On-Prem VPC is created.
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
