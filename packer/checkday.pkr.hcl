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

variable "APPLICATION_PORT" {
  type    = string
  default = env("APPLICATION_PORT")
}

variable "GOOGLE_CLIENT_ID" {
  type    = string
  default = env("GOOGLE_CLIENT_ID")
}

variable "GOOGLE_CLIENT_SECRET" {
  type    = string
  default = env("GOOGLE_CLIENT_SECRET")
}

variable "SALT" {
  type    = string
  default = env("SALT")
}

variable "AES_KEY" {
  type    = string
  default = env("AES_KEY")
}

variable "INITIALIZATION_VECTOR" {
  type    = string
  default = env("INITIALIZATION_VECTOR")
}

variable "USER_COOKIE_AGE" {
  type    = string
  default = env("USER_COOKIE_AGE")
}

variable "IS_PRODUCTION" {
  type    = string
  default = env("IS_PRODUCTION")
}

variable "CRYPTO_ALGORITHM" {
  type    = string
  default = env("CRYPTO_ALGORITHM")
}

variable "CRYPTO_KEY" {
  type    = string
  default = env("CRYPTO_KEY")
}

variable "CRYPTO_IV_LENGTH" {
  type    = string
  default = env("CRYPTO_IV_LENGTH")
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
      "APPLICATION_PORT=${var.APPLICATION_PORT}",
      "GOOGLE_CLIENT_ID=${var.GOOGLE_CLIENT_ID}",
      "GOOGLE_CLIENT_SECRET=${var.GOOGLE_CLIENT_SECRET}",
      "SALT=${var.SALT}",
      "AES_KEY=${var.AES_KEY}",
      "INITIALIZATION_VECTOR=${var.INITIALIZATION_VECTOR}",
      "USER_COOKIE_AGE=${var.USER_COOKIE_AGE}",
      "IS_PRODUCTION=${var.IS_PRODUCTION}",
      "CRYPTO_ALGORITHM=${var.CRYPTO_ALGORITHM}",
      "CRYPTO_KEY=${var.CRYPTO_KEY}",
      "CRYPTO_IV_LENGTH=${var.CRYPTO_IV_LENGTH}",
      "DATABASE_USERNAME=${var.DATABASE_USERNAME}",
      "DATABASE_PASSWORD=${var.DATABASE_PASSWORD}",
      "DATABASE_HOST=${var.DATABASE_HOST}",
      "DATABASE_NAME=${var.DATABASE_NAME}",
      "DATABASE_DIALECT=${var.DATABASE_DIALECT}",
      "ACCESS_KEY=${var.ACCESS_KEY}",
      "SECRET_KEY=${var.SECRET_KEY}",
    ]
  }
}