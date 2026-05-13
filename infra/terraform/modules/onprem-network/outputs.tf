output "onprem_vpc_id" {
  description = "On-Prem Role VPC ID."
  value       = local.onprem_vpc_id
}

output "onprem_vpc_cidr_block" {
  description = "On-Prem Role VPC CIDR block."
  value       = local.onprem_vpc_cidr_block
}

output "onprem_public_subnet_id" {
  description = "On-Prem public subnet ID."
  value       = local.onprem_public_subnet_id
}

output "onprem_private_subnet_id" {
  description = "On-Prem private subnet ID."
  value       = local.onprem_private_subnet_id
}

output "onprem_public_route_table_id" {
  description = "On-Prem public route table ID."
  value       = local.onprem_public_route_table_id
}

output "onprem_private_route_table_id" {
  description = "On-Prem private route table ID."
  value       = local.onprem_private_route_table_id
}

output "onprem_internet_gateway_id" {
  description = "On-Prem internet gateway ID."
  value       = local.onprem_internet_gateway_id
}
