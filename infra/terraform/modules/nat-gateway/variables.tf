variable "project_name" {
  description = "Project name used in resource names."
  type        = string
}

variable "environment" {
  description = "Deployment environment name."
  type        = string
}

variable "enabled" {
  description = "Whether to create a NAT Gateway for private subnet egress."
  type        = bool
  default     = true
}

variable "public_subnet_id" {
  description = "Public subnet ID where the NAT Gateway is created."
  type        = string
}

variable "private_route_table_ids" {
  description = "Private route table IDs that receive 0.0.0.0/0 -> NAT Gateway."
  type        = list(string)
}

variable "tags" {
  description = "Common tags."
  type        = map(string)
  default     = {}
}
