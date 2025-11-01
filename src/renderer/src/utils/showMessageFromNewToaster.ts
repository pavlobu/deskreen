import { Intent, OverlayToaster } from '@blueprintjs/core';
import { createRoot, Root } from 'react-dom/client';

export async function showMessageFromNewToaster(
  msg: string,
  intent: Intent = Intent.PRIMARY,
): Promise<void> {
  const container = document.createElement('div');
  let root: Root | undefined;
  // Since this toaster isn't created in a portal, a fixed position container
  // is required for it to show at the top of the viewport. Otherwise the
  // toaster won't be visible until the user scrolls upward.
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.width = '100%';

  document.body.appendChild(container);

  return new Promise<void>(async (resolve) => {
    async function onDismiss() {
      resolve();

      // Wait for the message to fade out before completely unmounting the OverlayToaster.
      await new Promise((resolve) => setTimeout(resolve, 5000));

      root?.unmount();
      root = undefined;
      document.body.removeChild(container);
    }

    const toaster = await OverlayToaster.create(
      {},
      {
        container,
        domRenderer: (element, domContainer) => {
          root = createRoot(domContainer);
          root.render(element);
        },
      },
    );
    toaster.show({ intent, message: msg, onDismiss });
  });
}
