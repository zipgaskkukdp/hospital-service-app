output "service_vpc_id" {
  description = "Existing Service VPC ID."
  value       = data.aws_vpc.service.id
}

output "service_vpc_cidr_block" {
  description = "CIDR block of the existing Service VPC."
  value       = data.aws_vpc.service.cidr_block
}

output "public_subnet_ids" {
  description = "Existing public subnet IDs."
  value       = var.service_public_subnet_ids
}

output "private_app_subnet_ids" {
  description = "Existing private application subnet IDs."
  value       = var.service_private_app_subnet_ids
}

output "private_data_subnet_ids" {
  description = "Existing private data subnet IDs."
  value       = var.service_private_data_subnet_ids
}

output "route_table_ids_to_onprem" {
  description = "Existing Service VPC route table IDs that receive On-Prem routes."
  value       = local.route_table_ids_to_onprem
}
