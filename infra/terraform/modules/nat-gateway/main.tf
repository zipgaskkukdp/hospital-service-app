locals {
  name_prefix = "${var.project_name}-${var.environment}"
}

resource "aws_eip" "nat" {
  count  = var.enabled ? 1 : 0
  domain = "vpc"

  tags = merge(var.tags, {
    Name = "${local.name_prefix}-nat-eip"
  })
}

resource "aws_nat_gateway" "this" {
  count         = var.enabled ? 1 : 0
  allocation_id = aws_eip.nat[0].id
  subnet_id     = var.public_subnet_id

  tags = merge(var.tags, {
    Name = "${local.name_prefix}-nat"
  })
}

# If a private route table already has a 0.0.0.0/0 route, AWS returns a
# duplicate route error. Remove/import the existing route before apply.
resource "aws_route" "private_default_to_nat" {
  for_each = var.enabled ? toset(var.private_route_table_ids) : toset([])

  route_table_id         = each.value
  destination_cidr_block = "0.0.0.0/0"
  nat_gateway_id         = aws_nat_gateway.this[0].id
}
