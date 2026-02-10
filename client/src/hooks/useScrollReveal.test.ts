import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useScrollReveal } from "./useScrollReveal";

describe("useScrollReveal Hook", () => {
  beforeEach(() => {
    // Mock IntersectionObserver
    global.IntersectionObserver = vi.fn((callback) => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
      root: null,
      rootMargin: "",
      thresholds: [0.15],
    })) as any;
  });

  it("should return ref and isVisible properties", () => {
    const { result } = renderHook(() => useScrollReveal());
    
    expect(result.current).toHaveProperty("ref");
    expect(result.current).toHaveProperty("isVisible");
    expect(result.current.isVisible).toBe(false);
  });

  it("should accept custom threshold option", () => {
    const { result } = renderHook(() => 
      useScrollReveal({ threshold: 0.5 })
    );
    
    expect(result.current.isVisible).toBe(false);
  });

  it("should accept custom rootMargin option", () => {
    const { result } = renderHook(() => 
      useScrollReveal({ rootMargin: "50px" })
    );
    
    expect(result.current.isVisible).toBe(false);
  });

  it("should accept triggerOnce option", () => {
    const { result } = renderHook(() => 
      useScrollReveal({ triggerOnce: true })
    );
    
    expect(result.current.isVisible).toBe(false);
  });

  it("should have default options", () => {
    const { result } = renderHook(() => useScrollReveal());
    
    expect(result.current.ref).toBeDefined();
    expect(result.current.isVisible).toBe(false);
  });

  it("should return a ref object that can be attached to elements", () => {
    const { result } = renderHook(() => useScrollReveal());
    
    expect(result.current.ref).toHaveProperty("current");
  });
});
