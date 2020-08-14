import React from 'react';
import {
  Alignment,
  AnchorButton,
  Classes,
  Navbar,
  Switch,
} from '@blueprintjs/core';

export default function NavPanel() {
  const darkThemeToggleStyles = { marginBottom: 0 };

  const handleToggleDarkTheme = () => {
    document.body.classList.toggle(Classes.DARK);
  };

  return (
    <Navbar className={Classes.DARK}>
      <Navbar.Group align={Alignment.LEFT}>
        <Navbar.Heading>Deskreen</Navbar.Heading>
      </Navbar.Group>
      <Navbar.Group align={Alignment.RIGHT}>
        <AnchorButton href="#" text="Home" />
        <Navbar.Divider />
        <Navbar.Divider />
        <Switch
          style={darkThemeToggleStyles}
          label="Dark theme"
          onChange={handleToggleDarkTheme}
        />
      </Navbar.Group>
    </Navbar>
  );
}
