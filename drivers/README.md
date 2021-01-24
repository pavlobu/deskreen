## Deskreen `drivers` : getting rid from Display Dummy Plugs

We plan to add vritual display driver support for three most popular operating systems. The driver related codes can be placed in following subdirectories `win`, `mac`, `linux`.
It is a challenging technical task and we need to enable an entire community power to solve it. If you know a solution and willing to contribute, you are highly welcome!

### Things that you need to keep in mind while making your virtual display driver solution for Deskreen:

1. The driver code can be in any language you are comfortable with, the most important that the API should provide a functionality to:

- **add**
- **set virtual display resolution**
- **get virtual display resolution**
- **get available resolutions of virtual display**
- **remove the virtual display**

2. Your driver code will be interfaced with Typescript/JavaScript after your successful submission. You **don't** have to write an interface for JS yourself. The community will come to help. It is going to be implemented by maintainer and other community members if there are any to voluneer. But if you want, you can participate in making a JS interface for it.
3. After creating virtual display with you driver code API, it should display virtual screen in native **OS** _Displays_ settings, so that user will be able to arrange it as a normal display. (similar to how commercial solutions work)

### What Your Driver API Should Have:

#### Add Virtual Display

```C++
// creates a virtual display with a list of common display resolutions available, sets default display resolution to
// some decent one ex: 1280x720
driver.addVirtualDisplay() :  // returns OS specific virtual display ID usually it's integer but can be other type as well.
```

#### Set Virtual Display Resolution

```C++
driver.setVirtualDisplayResolution(virtualDisplayID: 123543, width: 640, height: 480) :  // returns void
```

#### Get Virtual Display Resolution

```C++
driver.getVirtualDisplayResolution(virtualDisplayID: 123543) :  // returns object: { width: int, height: int }
```

#### Get Available Virtual Display Resolutions

```C++
driver.getAvailableVirtualDisplayResolutions(virtualDisplayID: 123543) :  // returns object: { width: int, height: int }
```

#### Remove Virtual Display -- disconnects virtual display from OS

```C++
driver.removeVirtualDisplay(virtualDisplayID: 123543) :  // return void
```

#### Remove All Virtual Displays

```C++
driver.removeAllVirtualDisplays() :  // return void
```

#### Get All Virtual Displays

```C++
driver.getAllVirtualDisplays() :  // returns array of virtual display objects created by driver: [{ displayID: int, width: int, height: int }, ...]
```

### OS Patches: To Be Discussed to Make a Right Decision

After OS updates your driver code **may** break. This happens even in commertial second screen software, so we need to think on how to add patches for OS updates in that case.

#### Ideas on how patching done in other projects can be found here:

1. rdpwrap - a tool that allows to have multiple user sessions in windows: https://github.com/stascorp/rdpwrap
   they have patches for each minor windows update.
