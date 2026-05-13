output "onprem_vpc_id" {
  description = "On-Prem Role VPC ID."
  value       = aws_vpc.this.id
}

output "onprem_vpc_cidr_block" {
  description = "On-Prem Role VPC CIDR block."
  value       = aws_vpc.this.cidr_block
}

output "onprem_public_subnet_id" {
  description = "On-Prem public subnet ID."
  value       = aws_subnet.public.id
}

output "onprem_private_subnet_id" {
  description = "On-Prem private subnet ID."
  value       = aws_subnet.private.id
}

output "onprem_public_route_table_id" {
  description = "On-Prem public route table ID."
  value       = aws_route_table.public.id
}

output "onprem_private_route_table_id" {
  description = "On-Prem private route table ID."
  value       = aws_route_table.private.id
}

output "onprem_internet_gateway_id" {
  description = "On-Prem internet gateway ID."
  value       = aws_internet_gateway.this.id
}
