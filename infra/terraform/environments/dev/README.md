# Dev Terraform Environment

This environment creates infra-only AWS resources for the AI Care hybrid service.
It does not deploy application code, Kubernetes manifests, ALB Controller, Lambda
functions, GitHub Actions workflows, or frontend/backend runtime workloads.

## Before Running

Fill either `tfvars.env.local` from `tfvars.env.example` or create a local
`terraform.tfvars` from `terraform.tfvars.example`. Do not commit either local
file.

Required real values:

- `service_vpc_id`
- `service_public_subnet_ids`
- `service_private_app_subnet_ids`
- `service_private_data_subnet_ids`
- `reports_bucket_name`
- `cluster_public_access_cidrs`

`service_route_table_ids_to_onprem` can be left empty to discover route tables
from `service_private_app_subnet_ids` at plan time.

The dev example already includes these existing On-Prem values:

- `existing_onprem_vpc_id = "vpc-0a53924e1ccaeb2e2"`
- `existing_onprem_public_subnet_id = "subnet-04b1cf699c6c52520"`
- `existing_onprem_private_subnet_id = "subnet-0652c89ea58554194"`

The On-Prem route table IDs are intentionally blank for now. Fill
`existing_onprem_public_route_table_id` and
`existing_onprem_private_route_table_id` when the IDs are available.

## Commands

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

## Defaults

- Region: `ap-northeast-2`
- Project: `ai-care`
- Environment: `dev`
- This example references the existing On-Prem VPC/subnets with
  `create_onprem_network=false`.
- CI/CD: disabled by `enable_cicd=false`
- AI processor Lambda: disabled by `create_ai_processor_lambda=false`
- ECR default repositories exclude `board-service`; add it explicitly to
  `app_ecr_repository_names` if needed later.

## Secrets

Do not put DB passwords, JWT secrets, field encryption keys, API keys, AWS
secret keys, database URLs, or VPN PSKs in Terraform files. RDS master password
management is delegated to AWS Secrets Manager.
