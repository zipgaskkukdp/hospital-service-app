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
