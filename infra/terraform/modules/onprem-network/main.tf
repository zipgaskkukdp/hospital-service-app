locals {
  name_prefix = "${var.project_name}-${var.environment}-onprem"
}

data "aws_vpc" "existing" {
  count = var.create_onprem_network ? 0 : 1
  id    = var.existing_onprem_vpc_id
}

data "aws_subnet" "existing_public" {
  count = var.create_onprem_network ? 0 : 1
  id    = var.existing_onprem_public_subnet_id
}

data "aws_subnet" "existing_private" {
  count = var.create_onprem_network ? 0 : 1
  id    = var.existing_onprem_private_subnet_id
}

data "aws_route_table" "existing_public_by_id" {
  count          = !var.create_onprem_network && var.existing_onprem_public_route_table_id != "" ? 1 : 0
  route_table_id = var.existing_onprem_public_route_table_id
}

data "aws_route_table" "existing_public_by_subnet" {
  count     = !var.create_onprem_network && var.existing_onprem_public_route_table_id == "" ? 1 : 0
  subnet_id = var.existing_onprem_public_subnet_id
}

data "aws_route_table" "existing_private_by_id" {
  count          = !var.create_onprem_network && var.existing_onprem_private_route_table_id != "" ? 1 : 0
  route_table_id = var.existing_onprem_private_route_table_id
}

data "aws_route_table" "existing_private_by_subnet" {
  count     = !var.create_onprem_network && var.existing_onprem_private_route_table_id == "" ? 1 : 0
  subnet_id = var.existing_onprem_private_subnet_id
}

locals {
  onprem_vpc_id                 = try(aws_vpc.this[0].id, data.aws_vpc.existing[0].id)
  onprem_vpc_cidr_block         = try(aws_vpc.this[0].cidr_block, data.aws_vpc.existing[0].cidr_block)
  onprem_public_subnet_id       = try(aws_subnet.public[0].id, data.aws_subnet.existing_public[0].id)
  onprem_private_subnet_id      = try(aws_subnet.private[0].id, data.aws_subnet.existing_private[0].id)
  onprem_public_route_table_id  = try(aws_route_table.public[0].id, data.aws_route_table.existing_public_by_id[0].id, data.aws_route_table.existing_public_by_subnet[0].id)
  onprem_private_route_table_id = try(aws_route_table.private[0].id, data.aws_route_table.existing_private_by_id[0].id, data.aws_route_table.existing_private_by_subnet[0].id)
  onprem_internet_gateway_id    = try(aws_internet_gateway.this[0].id, var.existing_onprem_internet_gateway_id != "" ? var.existing_onprem_internet_gateway_id : null)
}

resource "aws_vpc" "this" {
  count                = var.create_onprem_network ? 1 : 0
  cidr_block           = var.onprem_vpc_cidr
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = merge(var.tags, {
    Name = "${local.name_prefix}-vpc"
  })
}

resource "aws_subnet" "public" {
  count                   = var.create_onprem_network ? 1 : 0
  vpc_id                  = aws_vpc.this[0].id
  cidr_block              = var.onprem_public_subnet_cidr
  availability_zone       = var.onprem_availability_zone
  map_public_ip_on_launch = true

  tags = merge(var.tags, {
    Name = "${local.name_prefix}-public"
    Tier = "public"
  })
}

resource "aws_subnet" "private" {
  count                   = var.create_onprem_network ? 1 : 0
  vpc_id                  = aws_vpc.this[0].id
  cidr_block              = var.onprem_private_subnet_cidr
  availability_zone       = var.onprem_availability_zone
  map_public_ip_on_launch = false

  tags = merge(var.tags, {
    Name = "${local.name_prefix}-private"
    Tier = "private"
  })
}

resource "aws_internet_gateway" "this" {
  count  = var.create_onprem_network ? 1 : 0
  vpc_id = aws_vpc.this[0].id

  tags = merge(var.tags, {
    Name = "${local.name_prefix}-igw"
  })
}

resource "aws_route_table" "public" {
  count  = var.create_onprem_network ? 1 : 0
  vpc_id = aws_vpc.this[0].id

  tags = merge(var.tags, {
    Name = "${local.name_prefix}-public-rt"
  })
}

resource "aws_route" "public_default" {
  count                  = var.create_onprem_network ? 1 : 0
  route_table_id         = aws_route_table.public[0].id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.this[0].id
}

resource "aws_route_table_association" "public" {
  count          = var.create_onprem_network ? 1 : 0
  subnet_id      = aws_subnet.public[0].id
  route_table_id = aws_route_table.public[0].id
}

resource "aws_route_table" "private" {
  count  = var.create_onprem_network ? 1 : 0
  vpc_id = aws_vpc.this[0].id

  tags = merge(var.tags, {
    Name = "${local.name_prefix}-private-rt"
  })
}

resource "aws_route_table_association" "private" {
  count          = var.create_onprem_network ? 1 : 0
  subnet_id      = aws_subnet.private[0].id
  route_table_id = aws_route_table.private[0].id
}
