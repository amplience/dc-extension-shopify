# Below are instructions on how to create Roles and Policies for the application

## Create AWS Policy for AWS Role

1. Go to [IAM](https://console.aws.amazon.com/iam)
1. Select **Policies** > **Create policy**
1. Select **JSON** and add:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "logs:*"
            ],
            "Resource": "arn:aws:logs:*:*:*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "xray:PutTraceSegments",
                "xray:PutTelemetryRecords"
            ],
            "Resource": [
                "*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "ec2:AttachNetworkInterface",
                "ec2:CreateNetworkInterface",
                "ec2:DeleteNetworkInterface",
                "ec2:DescribeInstances",
                "ec2:DescribeSecurityGroups",
                "ec2:DescribeNetworkInterfaces",
                "ec2:DetachNetworkInterface",
                "ec2:ModifyNetworkInterfaceAttribute",
                "ec2:ResetNetworkInterfaceAttribute"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:*"
            ],
            "Resource": "arn:aws:s3:::*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "kinesis:*"
            ],
            "Resource": "arn:aws:kinesis:*:*:*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "sns:*"
            ],
            "Resource": "arn:aws:sns:*:*:*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "sqs:*"
            ],
            "Resource": "arn:aws:sqs:*:*:*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "dynamodb:*"
            ],
            "Resource": "arn:aws:dynamodb:*:*:*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "route53:*"
            ],
            "Resource": "*"
        }
    ]
}
```

:info: Name the policy something unique to identify the policy

## Create AWS IAM ROLE

1. Go to [IAM](https://console.aws.amazon.com/iam)
1. Select **Role** > **Create Role**
1. For **Select Type of trusted entity** select **AWS service**
1. For "Choose the service that will use this role" select **EC2**
1. Select **Next: Permissions**
1. Find the newly created policy from the above and select it
1. Select **Next: Review**
1. Select **Create role**

## Add Trust Relationship

1. Select the newly created role (above)
1. In **IAM roles** select **Trust Relationships**
1. Edit the Trust relationship, and add JSON below
1. Lastly, select **Update Trust Policy**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "",
      "Effect": "Allow",
      "Principal": {
        "Service": [
          "dynamodb.amazonaws.com",
        ]
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

:info: Copy the Role ARN i.e. arn:aws:I am::[ROLE_ID]:role/[CUSTOM_ROLE]

## Group-Level Permissions Policy for Dynamo

1. Go to [IAM](https://console.aws.amazon.com/iam)
1. Select **Policies** > **Create policy**
1. Select **JSON** and add:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "iam:GetRole",
                "iam:PutRolePolicy"
            ],
            "Resource": [
                "*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "iam:PassRole"
            ],
            "Resource": [
                "arn:aws:iam::[ROLE_ID]:role/[ROLENAME]"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "dynamodb:BatchGet*",
                "dynamodb:DescribeStream",
                "dynamodb:DescribeTable",
                "dynamodb:Get*",
                "dynamodb:Query",
                "dynamodb:Scan",
                "dynamodb:BatchWrite*",
                "dynamodb:CreateTable",
                "dynamodb:Delete*",
                "dynamodb:Update*",
                "dynamodb:PutItem"
            ],
            "Resource": [
                "*"
            ]
        }
    ]
}
```

:info: Replace arn:aws:iam::[ROLE_ID]:role/[ROLE_NAME] with your above Role ARN and role name

## Create AWS IAM Group

1. Go to [IAM](https://console.aws.amazon.com/iam)
1. Select **Groups** > **Create New Group**
1. Set a name for your group
1. Find and add the Dyanamo policy you created above

:warning: Do not add the CustomRolePolicy to the group.
Creating a group is optional. You can just add these polices to the user only (below), if you prefer. I work with groups that way I can add/remove users if needed. This is standard practice because I can focus more on managing Groups and their policies rather than individual users.

## Create AWS IAM User

1. Go to [IAM](https://console.aws.amazon.com/iam)
1. Select **Users** then select **Add user**
1. Do not add policies to the user directly, the group has them
1. Set a user name
1. Check access type: **Programmatic access**
1. Select **Next: Permissions**
1. Add user to the **CustomGroup** (created above)
1. Select **Next: Review**
1. Select **Create user**

:info: Make note of your Access key ID and Secret access key and ensure they are safely kept and appropriately shared