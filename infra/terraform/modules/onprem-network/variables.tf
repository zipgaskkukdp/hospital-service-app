variable "project_name" {
  description = "Project name used in resource names."
  type        = string
}

variable "environment" {
  description = "Deployment environment name."
  type        = string
}

variable "onprem_vpc_cidr" {
  description = "CIDR block for the On-Prem Role VPC."
  type        = string
}

variable "create_onprem_network" {
  description = "Whether to create the On-Prem Role VPC. Set false to reference an existing On-Prem VPC/subnets."
  type        = bool
  default     = true
}

variable "existing_onprem_vpc_id" {
  description = "Existing On-Prem VPC ID when create_onprem_network=false."
  type        = string
  default     = ""
}

variable "existing_onprem_public_subnet_id" {
  description = "Existing On-Prem public subnet ID when create_onprem_network=false."
  type        = string
  default     = ""
}

variable "existing_onprem_private_subnet_id" {
  description = "Existing On-Prem private subnet ID when create_onprem_network=false."
  type        = string
  default     = ""
}

variable "existing_onprem_public_route_table_id" {
  description = "Optional existing On-Prem public route table ID. When empty, it is discovered from the public subnet."
  type        = string
  default     = ""
}

variable "existing_onprem_private_route_table_id" {
  description = "Optional existing On-Prem private route table ID. When empty, it is discovered from the private subnet."
  type        = string
  default     = ""
}

variable "existing_onprem_internet_gateway_id" {
  description = "Optional existing On-Prem internet gateway ID when create_onprem_network=false."
  type        = string
  default     = ""
}

variable "onprem_public_subnet_cidr" {
  description = "CIDR block for the On-Prem public subnet."
  type        = string
}

variable "onprem_private_subnet_cidr" {
  description = "CIDR block for the On-Prem private subnet."
  type        = string
}

variable "onprem_availability_zone" {
  description = "Availability Zone for the On-Prem Role VPC subnets."
  type        = string
}

variable "tags" {
  description = "Common tags."
  type        = map(string)
  default     = {}
}
