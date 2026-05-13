terraform {
  required_version = "= 1.14.9"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = local.common_tags
  }
}

locals {
  common_tags = merge(var.tags, {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
    Scope       = "infra-only"
  })
}

module "existing_network" {
  source = "../../modules/existing-network"

  service_vpc_id                    = var.service_vpc_id
  service_public_subnet_ids         = var.service_public_subnet_ids
  service_private_app_subnet_ids    = var.service_private_app_subnet_ids
  service_private_data_subnet_ids   = var.service_private_data_subnet_ids
  service_route_table_ids_to_onprem = var.service_route_table_ids_to_onprem
  expected_service_vpc_cidr         = var.expected_service_vpc_cidr
  tags                              = local.common_tags
}

module "onprem_network" {
  source = "../../modules/onprem-network"

  project_name               = var.project_name
  environment                = var.environment
  onprem_vpc_cidr            = var.onprem_vpc_cidr
  onprem_public_subnet_cidr  = var.onprem_public_subnet_cidr
  onprem_private_subnet_cidr = var.onprem_private_subnet_cidr
  onprem_availability_zone   = var.onprem_availability_zone
  tags                       = local.common_tags
}

module "security" {
  source = "../../modules/security"

  project_name            = var.project_name
  environment             = var.environment
  service_vpc_id          = module.existing_network.service_vpc_id
  service_vpc_cidr_block  = module.existing_network.service_vpc_cidr_block
  onprem_vpc_id           = module.onprem_network.onprem_vpc_id
  allowed_alb_cidr_blocks = var.allowed_alb_cidr_blocks
  allowed_vpn_cidr_blocks = var.allowed_vpn_cidr_blocks
  backend_container_port  = var.backend_container_port
  fastapi_port            = var.fastapi_port
  postgres_port           = var.postgres_port
  tags                    = local.common_tags
}

module "onprem_compute" {
  source = "../../modules/onprem-compute"

  project_name                      = var.project_name
  environment                       = var.environment
  ami_id                            = var.onprem_ami_id
  instance_type                     = var.onprem_instance_type
  strongswan_instance_type          = var.strongswan_instance_type
  onprem_ec2_key_name               = var.onprem_ec2_key_name
  onprem_public_subnet_id           = module.onprem_network.onprem_public_subnet_id
  onprem_private_subnet_id          = module.onprem_network.onprem_private_subnet_id
  strongswan_security_group_id      = module.security.strongswan_security_group_id
  fastapi_security_group_id         = module.security.fastapi_security_group_id
  onprem_postgres_security_group_id = module.security.onprem_postgres_security_group_id
  strongswan_private_ip             = var.strongswan_private_ip
  fastapi_private_ip                = var.fastapi_private_ip
  onprem_postgres_private_ip        = var.onprem_postgres_private_ip
  fastapi_port                      = var.fastapi_port
  postgres_port                     = var.postgres_port
  root_volume_size                  = var.onprem_root_volume_size
  tags                              = local.common_tags
}

module "vpn" {
  source = "../../modules/vpn"

  project_name                      = var.project_name
  environment                       = var.environment
  service_vpc_id                    = module.existing_network.service_vpc_id
  service_vpc_cidr_block            = module.existing_network.service_vpc_cidr_block
  onprem_vpc_cidr_block             = module.onprem_network.onprem_vpc_cidr_block
  service_route_table_ids_to_onprem = module.existing_network.route_table_ids_to_onprem
  onprem_private_route_table_id     = module.onprem_network.onprem_private_route_table_id
  strongswan_public_ip              = module.onprem_compute.strongswan_public_ip
  strongswan_network_interface_id   = module.onprem_compute.strongswan_network_interface_id
  customer_gateway_bgp_asn          = var.customer_gateway_bgp_asn
  tags                              = local.common_tags
}

module "rds" {
  source = "../../modules/rds"

  project_name            = var.project_name
  environment             = var.environment
  private_data_subnet_ids = module.existing_network.private_data_subnet_ids
  rds_security_group_id   = module.security.rds_security_group_id
  engine_version          = var.rds_engine_version
  instance_class          = var.rds_instance_class
  allocated_storage       = var.rds_allocated_storage
  max_allocated_storage   = var.rds_max_allocated_storage
  db_name                 = var.rds_db_name
  username                = var.rds_username
  multi_az                = var.rds_multi_az
  backup_retention_period = var.rds_backup_retention_period
  deletion_protection     = var.rds_deletion_protection
  skip_final_snapshot     = var.rds_skip_final_snapshot
  tags                    = local.common_tags
}

module "eks" {
  source = "../../modules/eks"

  project_name                    = var.project_name
  environment                     = var.environment
  private_app_subnet_ids          = module.existing_network.private_app_subnet_ids
  public_subnet_ids               = module.existing_network.public_subnet_ids
  eks_node_security_group_id      = module.security.eks_node_security_group_id
  cluster_version                 = var.eks_cluster_version
  cluster_endpoint_public_access  = var.cluster_endpoint_public_access
  cluster_endpoint_private_access = var.cluster_endpoint_private_access
  cluster_public_access_cidrs     = var.cluster_public_access_cidrs
  node_instance_types             = var.eks_node_instance_types
  node_desired_size               = var.eks_node_desired_size
  node_min_size                   = var.eks_node_min_size
  node_max_size                   = var.eks_node_max_size
  tags                            = local.common_tags
}

module "app_services" {
  source = "../../modules/app-services"

  project_name                      = var.project_name
  environment                       = var.environment
  app_ecr_repository_names          = var.app_ecr_repository_names
  ecr_force_delete                  = var.ecr_force_delete
  reports_bucket_name               = var.reports_bucket_name
  reports_s3_prefix                 = var.reports_s3_prefix
  reports_bucket_force_destroy      = var.reports_bucket_force_destroy
  cloudwatch_log_retention_days     = var.cloudwatch_log_retention_days
  eks_oidc_provider_arn             = module.eks.eks_oidc_provider_arn
  eks_oidc_issuer_url               = module.eks.eks_oidc_issuer_url
  backend_service_account_namespace = var.backend_service_account_namespace
  backend_service_account_name      = var.backend_service_account_name
  create_ai_processor_lambda        = var.create_ai_processor_lambda
  ai_processor_image_uri            = var.ai_processor_image_uri
  tags                              = local.common_tags
}

module "cicd" {
  count  = var.enable_cicd ? 1 : 0
  source = "../../modules/cicd"

  project_name                  = var.project_name
  environment                   = var.environment
  create_github_oidc_provider   = var.create_github_oidc_provider
  github_oidc_provider_arn      = var.github_oidc_provider_arn
  github_repository             = var.github_repository
  github_branch                 = var.github_branch
  create_github_ecr_push_role   = var.create_github_ecr_push_role
  create_github_eks_deploy_role = var.create_github_eks_deploy_role
  create_terraform_apply_role   = var.create_terraform_apply_role
  tags                          = local.common_tags
}
