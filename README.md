
# User Service

The **User Service** is a microservice responsible for managing user-related operations in a multi-service architecture. This service handles user registration, authentication, profile management, and integrates with other services for personalized user experiences, such as managing shopping carts or order history.

---

## Features

- **User Registration:** Allow users to register with their details, such as name, email, password, and other personal information.
- **User Authentication:** Support login and authentication via email/password or other methods like social media login (e.g., Google, Facebook).
- **User Profile Management:** Users can update their profile details, such as name, contact information, and preferences.
- **Session Management:** Manage user sessions and maintain login status.
- **Role Management:** (Optional) Assign roles (e.g., admin, customer) to users for different access levels.


---

## Technologies Used

- **Node.js:** Backend runtime environment.
- **Express.js:** Framework for building RESTful APIs.
- **MongoDB:** Database for storing product information.
- **Mongoose:** ORM for MongoDB interactions.
- **RabbitMQ:** Message broker for communication with other microservices (e.g., Order, Search).
- **Cloudinary:** (Optional) For handling product image uploads.

---

## Installation and Setup

### Steps to Set Up

1. Delete the `node_modules` folder, then run the following command in the root directory:
   ```bash
   npm install

2. Create a .env file that looks like this:
   
		DB_URI=<your MongoDB URI>
		MESSAGE_BROKER_URL=<Your broker URL>
		EXCHANGE_NAME=<any exchange name of your choice>
		QUEUE_NAME=<any queue name of your choice>
		CUSTOMER_BINDING_KEY=<variable to bind messages to the user/customer queue. eg customerBindingKey>
		PRODUCT_BINDING_KEY=< variable to bind messages to the product queue. eg productBindingKey>
		NOTIFICATION_BINDING_KEY=<variable to bind messages to the notification queue. eg notificationBindingKey>

	



	3.	Note:
The RabbitMQ URL for interservice communication can be obtained from CloudAMQP:
	•	Create a new instance and follow the prompts.
	•	After creating the instance, click on the link for the instance with the name you gave it to view and copy the URL.
	4.	Start the service by running:

Run:


	5.	node index.js


You can now test the APIs

This is one of the four services for the **Multivendor Application**.  

### Related Repositories

- **Shopping Frontend:**  
  [MultivendorPlatform-Shopping-Frontend](https://github.com/haariswaqas/MultivendorPlatform-Shopping-Frontend)

- **Notification Microservice:**  
  [MultiVendorPlatform-Notification-Microservice](https://github.com/samuel2l/MultiVendorPlatform-Notification-Microservice)

- **Products Microservice:**  
  [MultiVendorApp-Products-Microservice](https://github.com/samuel2l/MultiVendorApp-Products-Microservice)

- **Shopping Microservice:**  
  [MultiVendorApp-Products-Microservice](https://github.com/samuel2l/MultivendorPlatform-Shopping-Service)

- **Web App**: The web version of this app, designed by [haariswaqas](https://github.com/haariswaqas//MultivendorPlatform-Shopping-Frontend)
- **Mobile App**: [Mobile app](https://github.com/samuel2l/MultiVendorPlatform-Mobile-Application)