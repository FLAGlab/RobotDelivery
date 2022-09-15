# RobotDelivery

This repository contains the simulationo environment for a robot delivery system within a warehouse. The purpose of the robot is to move packages in the warehouse to the collection point to be send out for delivery.

This repository is **work in progress** and is set to be used for experimentation of learning algorithms. Therefore, the project is in continuous evolution.

### Folder Layout

The repository contains the files related to the enviroment, the learning algorithm and the obtained results

- data contains the results of our evaluation
- environment contains the environment and agent definitions
- learning contains learning algorithm definitions (we use qlearning)
- tests contain different warehouse maps
- vendor contains the required libraries

### Running

To run the experiment it is only necesary to execute the `environment.js` file. In the you may set up the map to use