# Coderitter API Architecture

The Coderitter API Architecture is a cloud application architecture which emphasizes programming instead of configuring. It is not a framework but a guidance on how to program.

## Features

- Fastest possible UI responsivity
- Continuous UI updates
- Offline cababilities

## Programming instead of configuring

Frameworks are blackboxes which hide their inner workings. They are supposed to be adjusted by configuring them. For example, the programmer can set certain properties or provide a piece of code which then at a later point in time is executed by the framework. The programmer gives control to the framework.

There are a few problems arising from this approach. While frameworks hide details to create certain layers of convenience, it is at the same time very unconvenient if something does not work as expected. In these cases a framework needs to rely on excellent documentation. Documentation also has its problems. It can be hard to understand or simply missing details.

The next step for the programmer is to start to look at the framework code, debugging her/his way through. In the long run she/he even wants to understand what is going on under the hood if she/he wants to make informed decisions.

Another problem is that the programmer will rather earlier than later hit the limits of a framework. It then becomes really painful to work around its limitiations. A feature rich framework also become very complex real fast because every added framework feature can increase the complexity exponentially. The more opiniated a framework is, the harder it is for the framework designer to put all the opinions into it. A framework creator will need artisticly designed code to include every wanted feature. Eventually that makes the code hard to understand.

These problems arises from the wish to hide the code which in turn enforce a configurabilty. That is why the Coderitter API Architecture focuses on code which is visible to and adjustable by the programmer. Instead of hiding the application flow it exposed. Complicated functionality is hidden in small and focused libraries which serve the programmer as a hammer rather than a robot which is configured to swing the hammer for the programmer.

The Coderitter API Architecture gives back control to the programmer. Programming skills and styles can and must be developed and evolved. It brings back the craft and the fun.

## Overview

Overview...

### Docker

### Main entry point and services

### Pages

### Components

### Object database and continuous changes

### Translations