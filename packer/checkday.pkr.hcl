packer {
  required_plugins {
    amazon = {
      source  = "github.com/hashicorp/amazon"
      version = "~> 1.2.9"
    }
  }
}

variable "ACCESS_KEY" {
  type    = string
  default = env("ACCESS_KEY")
}

variable "SECRET_KEY" {
  type    = string
  default = env("SECRET_KEY")
}

variable "DATABASE_USERNAME" {
  type    = string
  default = env("DATABASE_USERNAME")
}

variable "DATABASE_PASSWORD" {
  type    = string
  default = env("DATABASE_PASSWORD")
}

variable "DATABASE_HOST" {
  type    = string
  default = env("DATABASE_HOST")
}

variable "DATABASE_NAME" {
  type    = string
  default = env("DATABASE_NAME")
}

variable "DATABASE_DIALECT" {
  type    = string
  default = env("DATABASE_DIALECT")
}

source "amazon-ebs" "ubuntu" {
  access_key    = "${var.ACCESS_KEY}"
  secret_key    = "${var.SECRET_KEY}"
  ami_name      = "checkday_ami_${formatdate("MM_DD_HH_MM", timestamp())}"
  instance_type = "t2.micro"
  region        = "us-east-1"
  source_ami    = "ami-0c7217cdde317cfec"
  ssh_username  = "ubuntu"
}

build {
  name    = "checkday_build"
  sources = ["source.amazon-ebs.ubuntu"]
  provisioner "file" {
    source      = "server.zip"
    destination = "server.zip"
  }
  provisioner "shell" {
    script = "packer/runner.sh"
    environment_vars = [
      "DATABASE_USERNAME=${var.DATABASE_USERNAME}",
      "DATABASE_PASSWORD=${var.DATABASE_PASSWORD}",
      "DATABASE_HOST=${var.DATABASE_HOST}",
      "DATABASE_NAME=${var.DATABASE_NAME}",
      "DATABASE_DIALECT=${var.DATABASE_DIALECT}",
    ]
  }
}