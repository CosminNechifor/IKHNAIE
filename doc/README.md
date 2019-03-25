# Circular economy on the blockchain

## What motivates this project? 

In this project I try to implement something that would be against the **linear economy model** which describes itself as: **Take** -> **Make** -> **Dispose**.

This model (``liniar``) as we can clearly see is not long term sustainable and comes with a lot 
of problems and disadvantages such as waste and emission leakage which results later in pollution. 
Further more in the case of **linear** model we have problems with the system because of the agents that are not being honest on how the resources are being managed.

The **circular economy model** focuses on **recycling**. It proves himself more sustainable then the **linear model** by reusing the raw material that was initially used in the creation of other products.

## Problems with the linear model and how does blockchain fit into the mix, in order to solve this problem?

One can not solve the problem by centralizing the ``circular model`` in my opinion, because of 
problems such as **corruption** and **lack of transparency**. 

That is why the new system has the following qualities **incorruptible**, **fully transparent** and to **benefit all actors**. This system will also solve problems such as ownership,
and will benefit all the honest actors using it.

And as we all know [ownership](https://www.economist.com/briefing/2015/10/31/the-great-chain-of-being-sure-about-things), corruption, lack of transparency and pollution are the biggest 
problems that we face in the 21st century. 

Thanks to the **Blockchain technology** I will be able to develop a system that will create a solution to those problems. 

## Objective  

The system has to make sure that every actor that is interacting with the components:

- Has the right to do so
- Is NOT malicious 
- Benefits himself and the others by using this system
- Provide immutable data => digital trails
- enable manufacturers, recyclers, all the way to consumers to confidently assert the circularity of their products

``to add more``

## Description 

All products that are tracked by the system will be divided into **components** and every component
will be composed by other components. 



## Contracts


**insert picture here with the design**

### Component 

Each component is gonna be separated into his own smart contract. This contract is gonna be responsible of storing all the events corresponding to the component, fields and methods that would allow
for better state management of the component.

Fields that a component should have: 

|           Name           | Type           | Description                                                                                                 |
|:------------------------:|----------------|-------------------------------------------------------------------------------------------------------------|
|           owner          |     address    |                    Is gonna keep the information about the current owner of the component                   |
|        entityName        | string/bytes32 |                                        The name of the current entity                                       |
|       creationTime       |     uint256    |                    The time at which the component was created / added to the Blockchain                    |
|        expiration        |     uint64     |                      Time when the component should be taken out of the market/recycled                     |
|           price          |     uint128    |                                     Price of the corresponding component                                    |
|           state          |   EntityState  |                                 Represents the state, this component is in.                                 |
|  parentComponentAddress  |     address    | Address of the component containing this component. Should be ``address(0)`` if the component doesn't exist |
|     otherInformation     |     string     |                                  Other information related to the component                                 |
| childComponentsAddresses |    address[]   |                                      Addresses of the child components                                      |


The ``state`` field is gonna be one of the must important fields of a component.

**insert picture with state management**

**Events** the ``ComponentContract`` will emit:

- 


### IComponent interface 

This will act as a proxy for the component contract and is gonna be called from both ``ComponentFactory`` contract the and ``Manager`` contract

### ComponentFactory

Contract responsible of creating(deploying) other components.

### IComponentFactory interface

Contract that takes care on the ``Deploymnet`` of the Components on the blockchain.

### Registry

Contract that stores the addresses of the deployed contract on the blockchain.

### IRegistry interface

Contract that acts like a proxy in order to interact with the registry contract.

### Manager

Contract that allows user to perform operations inside the system and also orchestrates the 
other contracts.


## State managemnt of components

## Events









