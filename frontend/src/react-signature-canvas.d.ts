declare module 'react-signature-canvas' {
  import { Component } from 'react';

  export interface SignatureCanvasProps {
    velocityFilterWeight?: number;
    minWidth?: number;
    maxWidth?: number;
    minDistance?: number;
    dotSize?: number | (() => number);
    penColor?: string;
    throttle?: number;
    canvasProps?: React.CanvasHTMLAttributes<HTMLCanvasElement>;
    clearOnResize?: boolean;
    backgroundColor?: string;
  }

  export default class SignatureCanvas extends Component<SignatureCanvasProps> {
    clear(): void;
    isEmpty(): boolean;
    fromDataURL(dataURL: string, options?: object): void;
    toDataURL(type?: string, encoderOptions?: number): string;
    fromData(pointGroups: any[]): void;
    toData(): any[];
    off(): void;
    on(): void;
    getCanvas(): HTMLCanvasElement;
    getTrimmedCanvas(): HTMLCanvasElement;
  }
}
