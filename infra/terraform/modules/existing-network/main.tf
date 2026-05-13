# This module intentionally creates no resources.
# It only validates and exposes existing Service VPC network identifiers.

data "aws_vpc" "service" {
  id = var.service_vpc_id
}

data "aws_subnet" "public" {
  for_each = toset(var.service_public_subnet_ids)
  id       = each.value
}

data "aws_subnet" "private_app" {
  for_each = toset(var.service_private_app_subnet_ids)
  id       = each.value
}

data "aws_subnet" "private_data" {
  for_each = toset(var.service_private_data_subnet_ids)
  id       = each.value
}

data "aws_route_table" "service_to_onprem" {
  for_each       = toset(var.service_route_table_ids_to_onprem)
  route_table_id = each.value
}

check "service_vpc_cidr" {
  assert {
    condition     = data.aws_vpc.service.cidr_block == var.expected_service_vpc_cidr
    error_message = "The existing Service VPC CIDR must be ${var.expected_service_vpc_cidr}."
  }
}
