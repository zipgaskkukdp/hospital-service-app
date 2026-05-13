output "nat_gateway_id" {
  description = "NAT Gateway ID."
  value       = try(aws_nat_gateway.this[0].id, null)
}

output "nat_gateway_public_ip" {
  description = "NAT Gateway Elastic IP public address."
  value       = try(aws_eip.nat[0].public_ip, null)
}

output "nat_gateway_eip_allocation_id" {
  description = "NAT Gateway Elastic IP allocation ID."
  value       = try(aws_eip.nat[0].allocation_id, null)
}

output "private_route_table_ids" {
  description = "Private route table IDs routed to the NAT Gateway."
  value       = var.enabled ? var.private_route_table_ids : []
}
