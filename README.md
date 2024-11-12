
---

# **Serverless Repository**

This repository contains the implementation of serverless functions for managing email verification using AWS Lambda, SNS, and an RDS instance. The serverless functions are triggered by messages from the web application via SNS and are responsible for sending email verification links and tracking email activity in the RDS instance.

---

## **Repository Setup**

### **1. Clone the Repository**
Fork the repository into your GitHub namespace.

Clone the forked repository locally:
   ```bash
   git clone https://github.com/<your-namespace>/serverless.git
   cd serverless
   ```

### **2. Add `.gitignore`**
Use a `.gitignore` template appropriate for Node.js (or your programming language of choice). Examples can be found [here](https://github.com/github/gitignore). 

Add the following lines to the `.gitignore` file:
```plaintext
node_modules/
.env
.DS_Store
dist/
*.log
```

### **3. Install Dependencies**
Make sure all required dependencies for the Lambda function are installed. For example, if using Node.js:
```bash
npm install
```

---

## **Architecture Overview**

### **1. Workflow**
- A new user account is created in the web application.
- The web application publishes a message to an **SNS Topic**.
- **SNS Topic** triggers the **Lambda function**.
- The **Lambda function**:
   - Sends an email with a verification link.
   - Saves email activity (such as sent status and expiry time) to the RDS database.

### **2. Components**
- **SNS**: Simple Notification Service for event-driven invocation.
- **Lambda**: Serverless function for processing email verification.
- **RDS Instance**: Relational Database Service to track email activities.

---

## **Implementation**

### **Lambda Function Responsibilities**
- **Send Verification Email**  
   - Use **AWS SES** (Simple Email Service) or another email service.
   - Generate a link with a unique token and expiry time (2 minutes).
- **Track Email Activity in RDS**  
   - Log the following details into the database:
     - Email address
     - Token
     - Sent timestamp
     - Expiry timestamp
     - Verification status (verified/unverified)

---

## **Environment Setup**

-  **Environment Variables**  
   Add a `.env` file to configure environment variables (do not commit this file). Example:
   ```plaintext
   RDS_HOST=<your-rds-host>
   RDS_PORT=<your-rds-port>
   RDS_USER=<your-db-username>
   RDS_PASSWORD=<your-db-password>
   RDS_DATABASE=<your-database-name>
   EMAIL_SERVICE=<your-email-service>
   SNS_TOPIC_ARN=<your-sns-topic-arn>
   ```

-  **Database Schema**
   Use the following schema for tracking email activities:
   ```sql
   CREATE TABLE email_verification (
       id SERIAL PRIMARY KEY,
       email VARCHAR(255) NOT NULL,
       token VARCHAR(255) NOT NULL,
       sent_at TIMESTAMP NOT NULL,
       expires_at TIMESTAMP NOT NULL,
       verified BOOLEAN DEFAULT FALSE
   );
   ```

- **IAM Roles**
   Ensure your Lambda function has the necessary permissions:
   - Access to publish messages to the SNS Topic.
   - Access to send emails using AWS SES.
   - Access to connect to the RDS database.

---

## **Deployment**

- **Package the Lambda Function**
   Create a deployment package:
   ```bash
   zip -r lambda_function.zip .
   ```

- **Deploy to AWS**
   Upload the Lambda function package using the AWS CLI or AWS Management Console:
   ```bash
   aws lambda update-function-code --function-name <lambda-function-name> --zip-file fileb://lambda_function.zip
   ```

- **Test the Lambda Function**
   Publish a test message to the SNS Topic to verify functionality.

---

## **Contributing**

### **Workflow**
1. Fork the repository.
2. Create a feature branch:
   ```bash
   git checkout -b feature/<your-feature>
   ```
3. Commit and push changes:
   ```bash
   git add .
   git commit -m "Implement <feature>"
   git push origin feature/<your-feature>
   ```
4. Raise a pull request to the main repository.

---

## **Usage**

1. Deploy the Lambda function and SNS Topic.
2. Ensure the web application publishes messages to the SNS Topic.
3. Verify email logs in the RDS database after testing.

---

## **License**
This project is licensed under the MIT License. See the `LICENSE` file for details.

---

## **Useful Links**
- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [AWS SNS Documentation](https://docs.aws.amazon.com/sns/)
- [AWS SES Documentation](https://docs.aws.amazon.com/ses/)
- [GitHub .gitignore Templates](https://github.com/github/gitignore)

--- 

Let me know if you need further refinements or additional details!