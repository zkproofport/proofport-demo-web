'use client';
import { Buffer } from 'buffer';

if (typeof window !== 'undefined' && !(window as any).Buffer) {
  (window as any).Buffer = Buffer;
}

if (typeof window !== 'undefined' && !(window as any).global) {
  (window as any).global = window;
}