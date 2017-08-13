# TheBus Arrivals Alexa Skill

This repository contains code for an AWS Lambda function that accesses the [TheBus API](http://hea.thebus.org/api_info.asp).

The Lambda function cannot execute without a file called `settings.json` in the root directory. The object must contain a key called `api_key`, and the corresponding value is the TheBus API Key. Please follow the instructions in the link in the above paragraph to obtain a key.
