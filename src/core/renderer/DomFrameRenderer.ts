// DOM-overlay variant of FrameRenderer<F>. Used for HUD elements that live in the HTML layer
// (fixed-position divs on top of the WebGL canvas) rather than as THREE.Group meshes.
//
// Same build / update / dispose contract, but build returns an HTMLElement the scenario
// appends to document.body (or any container), and update is called on window resize so the
// Renderer can recompute font sizes / absolute offsets that don't reflow via pure CSS.
export interface DomFrameRenderer<F> {
    build(frame: F): Promise<HTMLElement>;
    update(frame: F, element: HTMLElement, viewportWidth: number, viewportHeight: number): void;
    dispose(element: HTMLElement): void;
}
