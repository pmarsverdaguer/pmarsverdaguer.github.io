---
layout: post
author: Pau Mars Verdaguer
title: Linux Basics
tags: OS_fundamentals
---

For more information visit [HTB Academy Linux Fundamentals](https://academy.hackthebox.com/module/details/18) module.

## Table of Contents

<div id="Index">
  <a href="#Linux Structure">1. Linux Structure</a>
  <br><a href="#Components">1.1. Components</a>
  <br><a href="#Architecture">1.2. Architecture</a>
  <br><a href="#File Hierarchy">1.3. File Hierarchy</a>
  <br><a href="#Prompt Description">2. Prompt Description</a>
  <br><a href="#Sytem Information">3. Sytem Information</a>
  <br><a href="#System Management">4. System Management</a>
  <br><a href="#User Management">4.1. User Management</a>
  <br><a href="#Package Management">4.2. Package Management</a>
  <br><a href="#Service Management">4.3. Service Management</a>
  <br><a href="#Workflow">5. Workflow</a>
  <br><a href="#General">5.1. General</a>
  <br><a href="#Permission Management">5.2. Permission Management</a>
</div>


<h2 id="Linux Structure">1. Linux Structure</h2>

The main Linux phylosophy is that everything is a file. So you will always find a file for any action, program, configuration, etc.

<h3 id="Components">1.1. Components</h3>

Component             | Description               
--------------------- | --------------------- 
Bootloader            | Guides the booting process to start the OS        
OS Kernel             | Manages the resources at a hardware level
Daemons               | Background services that ensures everything runs correctly 
OS Shell              | Interface between the user and the OS 
Window Manager        | Aka GUI. It is the dektop environment 
Graphics Server       | Graphical sub-server to run programs locally or remotely
Utilities             | Programs that perform particular actions 

<h3 id="Architecture">1.2. Architecture</h3>

Layer                 | Description               
--------------------- | --------------------- 
Hardware              | Peripherial devices      
Kernel                | OS Core that virtualizes and uses harware resources
Shell                 | Command-Line Interface that allow users to execute processes
Utilities             | Makes all OS functions avalable to the user

<h3 id="File Hierarchy">1.3. File Hierarchy</h3>

![800x600](https://academy.hackthebox.com/storage/modules/18/NEW_filesystem.png)

Path 	  | Description
------- | --------------------- 
/ 		  | The top-level directory is the root filesystem and contains all of the files required to boot.
/bin 	  | Contains essential command binaries.
/boot 	| Consists of the static bootloader, kernel executable, and files required to boot the Linux OS.
/dev 	  | Contains device files to facilitate access to every hardware device attached to the system.
/etc 		| Local system configuration files. Configuration files for installed applications may be saved here as well.
/home   | Each user on the system has a subdirectory here for storage.
/lib 		| Shared library files that are required for system boot.
/media 	| External removable media devices such as USB drives are mounted here.
/mnt 		| Temporary mount point for regular filesystems.
/opt 		| Optional files such as third-party tools can be saved here.
/root 	| The home directory for the root user.
/sbin 	| This directory contains executables used for system administration (binary system files).
/tmp 		| In this directory the OS store temporary files. It is deleted after reboot.
/usr 		| Contains executables, libraries, man files, etc.
/var 		| This directory contains variable data files such as log files, email in-boxes, web application related files...



<h2 id="Prompt Description">2. Prompt Description</h2>

```bash
<username>@<hostname><current working directory>$
```

Home directory for user: [~]
<br>Dollar sign [$] stands for user.

```bash
<username>@<hostname>[~]$
```

Root shell prompt:

```bash
root@<hostname>[/]#
```

<h2 id="Sytem Information">3. Sytem Information</h2>

Command  |	Description
-------  | --------------------- 
whoami 	 | Displays current username.
id 	  	 | Returns users identity
hostname | Sets or prints the name of current host system.
uname 	 | Prints basic information about the operating system name and system hardware.
pwd 		 | Returns working directory name.
ifconfig | Used to view an address to a network interface and/or configure network interface parameters.
ip 		   | Ip is a utility to show or manipulate routing, network devices, interfaces and tunnels.
netstat  | Shows network status.
ss 	     | Another utility to investigate sockets.
ps 		   | Shows process status and assigned PID.
who      | Displays who is logged in.
env 	   | Prints environment or sets and executes command.
lsblk 	 | Lists block devices.
lsusb 	 | Lists USB devices
lsof 	   | Lists opened files.
lspci 	 | Lists PCI devices.


<h2 id="System Management">4. System Management</h2>

<h3 id="User Management">4.1. User Management</h3>

Command  |	Description
-------  | --------------------- 
sudo 	   | Execute command as a different user.
su 	     | The su utility requests appropriate user credentials via PAM and switches to that user ID.
useradd  | Creates a new user or update default new user information.
userdel  | Deletes a user account and related files.
usermod  | Modifies a user account.
addgroup | Adds a group to the system.
delgroup | Removes a group from the system.
passwd 	 | Changes user password.

<h3 id="Package Management">4.2. Package Management</h3>

Command  |	Description
-------  | ---------------------
dpkg 	   | The dpkg is a tool to install, build, remove, and manage Debian packages.
apt 	   | Apt provides a high-level command-line interface for the package management system.
snap 	   | Install, configure, refresh, and remove snap packages.
gem 	   | Gem is the front-end to RubyGems, the standard package manager for Ruby.
pip 	   | Pip is a Python package installer recommended for installing Python packages.
git 	   | Git is a fast, scalable, distributed revision control system with an unusually rich command set.

<h3 id="Service Management">4.3. Service Management</h3>

Every service or process, either running or backgrounded, have an assigned PID (Process ID). We can find all processes under `/proc/` directory. Using `systemctl` we can start, check, monitor and modify a service. A process can be in 1 out of 4 states:

- Running
- Waiting
- Stopped
- Zombie (Stopped but with an entry in the process table)

In order to kill a process, we use `kill` command in the following way:

```bash
kill -l #list all kill functions

kill number <PID> #kills accordingly to number selection
```
In order to see which processes are running and their PID, we can use `ps` command, and then execute the kill function.

Some processes may be wanted to run in background, to do so, we will enter the `bg` command. In order to check the program status we will use `jobs`. If we want to directly run a command in background, we will add "&" at the end of the command.

<h2 id="Workflow">5. Workflow</h2>

<h3 id="General">5.1. General</h3>

The following table describes all the basic commands used to navigate, work with directories, edit files and so on:

Command  |	Description
-------  | --------------------- 
ls 	     | Lists directory contents.
cd 	     | Changes the directory.
clear 	 | Clears the terminal.
touch    | Creates an empty file.
mkdir    | Creates a directory.
tree 	   | Lists the contents of a directory recursively.
mv 	     | Move or rename files or directories.
cp 	     | Copy files or directories.
nano 	   | Terminal based text editor.
which 	 | Returns the path to a file or link.
find 	   | Searches for files in a directory hierarchy.
updatedb | Updates the locale database for existing contents on the system.
locate 	 | Uses the locale database to find contents on the system.
more 	   | Pager that is used to read STDOUT or files.
less     | An alternative to more with more features.
head     | Prints the first ten lines of STDOUT or a file.
tail 	   | Prints the last ten lines of STDOUT or a file.
sort 	   | Sorts the contents of STDOUT or a file.
grep 		 | Searches for specific results that contain given patterns.
cut 	   | Removes sections from each line of files.
tr 		   | Replaces certain characters.
column 	 | Command-line based utility that formats its input into multiple columns.
awk 	   | Pattern scanning and processing language.
sed 	   | A stream editor for filtering and transforming text.
wc 		   | Prints newline, word, and byte counts for a given input.

File descriptors are indicators of connection used by the kernel to perform input/output operations:

- **STDIN - 0:** Input
- **STDOUT - 1:** Output
- **STDERR - 2:** Error

They can be redirected using `>`. Sometimes the following command is used at the end of the string to discard all outputs containing an error.
```bash
2>/dev/null
```
By redirecting STDERR-2 to /dev/null, we get rid of error outputs as null device discards all data.

<h3 id="Permission Management">5.2. Permission Management</h3>

Linux permissions can be assigned to Users and Groups and a user can be member of many groups as well. If we create a file, we will become the owner, and the file will belong to the group we belong and us. The type of permissions that can be assigned are:

- **(r)** - read
- **(w)** - write
- **(x)** - execute

Permissions can be assigned to:

- **owner**
- **group**
- **others**

```
- rwx rw- r--   1 root root 1641 May  4 23:42 /etc/passwd
- --- --- ---   |  |    |    |   |__________|
|  |   |   |    |  |    |    |        |_ Date
|  |   |   |    |  |    |    |__________ File Size
|  |   |   |    |  |    |_______________ Group
|  |   |   |    |  |____________________ User
|  |   |   |    |_______________________ Number of hard links
|  |   |   |_ Permission of others (read)
|  |   |_____ Permissions of the group (read, write)
|  |_________ Permissions of the owner (read, write, execute)
|____________ File type (- = File, d = Directory, l = Link, ... )
```

In order to change a file's permissions, `chmod` is used in the following way:
```
chmod [u-owner, g-group, o-others, a-all users] ["+" - add, "-" - remove] [r-read, w-whrite, x-execute] and the name of the file, directory or process.
```
For example, to add reading permission to all users:

```bash
chmod a+r shell
```