variable "service_vpc_id" {
  description = "Existing Service VPC ID created outside Terraform."
  type        = string
}

variable "service_public_subnet_ids" {
  description = "Existing public subnet IDs in the Service VPC."
  type        = list(string)
}

variable "service_private_app_subnet_ids" {
  description = "Existing private application subnet IDs in the Service VPC."
  type        = list(string)
}

variable "service_private_data_subnet_ids" {
  description = "Existing private data subnet IDs in the Service VPC."
  type        = list(string)
}

variable "service_route_table_ids_to_onprem" {
  description = "Existing Service VPC route table IDs that should receive the route to On-Prem. When empty, route tables are discovered from private app subnets."
  type        = list(string)
  default     = []
}

variable "expected_service_vpc_cidr" {
  description = "Expected CIDR block for the existing Service VPC."
  type        = string
  default     = "10.0.0.0/16"
}

variable "tags" {
  description = "Common tags. This module only reads existing network resources."
  type        = map(string)
  default     = {}
}
