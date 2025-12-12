import type React from "react";

declare global {
  namespace JSX {
    type Element = React.ReactElement<any, any>;
  }
}

export {};
