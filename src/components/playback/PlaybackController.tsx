'use client';

import { usePlayback } from '@/lib/playback/PlaybackContext';
import { useEffect, useRef } from 'react';
import { PLAYBACK_SEQUENCE, CURSOR_SPEED } from '@/lib/playback/playbackSequence';
import { useAppStore } from '@/lib/store';

export function PlaybackController() {
  const { isPlaybackActive, currentStep, setStep, togglePlayback } = usePlayback();
  const { setText, isAnalyzing } = useAppStore();
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const isExecutingRef = useRef(false);

  useEffect(() => {
    if (!isPlaybackActive || isExecutingRef.current) return;

    const executeStep = async () => {
      if (currentStep === 0 || currentStep > PLAYBACK_SEQUENCE.length) return;

      isExecutingRef.current = true;
      const step = PLAYBACK_SEQUENCE[currentStep - 1];

      console.log(`[Playback] Executing step ${step.step}: ${step.name}`);

      try {
        // Wait for initial delay
        if (step.delay) {
          await sleep(step.delay);
        }

        switch (step.action) {
          case 'typeText':
            await executeTypeText(step);
            break;
          case 'click':
            await executeClick(step);
            break;
          case 'clickAnnotation':
            await executeClickAnnotation(step);
            break;
          case 'wait':
            // Just wait, already handled by delay
            break;
          case 'waitForAnalysis':
            await executeWaitForAnalysis();
            break;
          case 'browserFlow':
            await executeBrowserFlow();
            break;
          case 'chatMessage':
            await executeChatMessage(step);
            break;
          case 'savedTabFlow':
            await executeSavedTabFlow();
            break;
          case 'editText':
            await executeEditText(step);
            break;
          case 'restart':
            await executeRestart();
            return; // Don't proceed to next step
        }

        // Move to next step
        isExecutingRef.current = false;
        setStep(currentStep + 1);
      } catch (error) {
        console.error(`[Playback] Error in step ${step.step}:`, error);
        isExecutingRef.current = false;
        setStep(currentStep + 1); // Skip to next step on error
      }
    };

    executeStep();
  }, [currentStep, isPlaybackActive]);

  // Reset when playback stops
  useEffect(() => {
    if (!isPlaybackActive) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      isExecutingRef.current = false;
    }
  }, [isPlaybackActive]);

  // Helper functions

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const moveCursorTo = async (element: Element, triggerHover = false) => {
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    console.log('[Playback] Moving cursor to:', { x, y, element: element.tagName });

    window.dispatchEvent(new CustomEvent('playback:moveCursor', {
      detail: { x, y }
    }));

    await sleep(CURSOR_SPEED);
    
    // Trigger hover events if requested
    if (triggerHover && element instanceof HTMLElement) {
      console.log('[Playback] Triggering hover on:', element);
      
      // Create and dispatch proper mouse events
      const mouseOverEvent = new MouseEvent('mouseover', { 
        bubbles: true, 
        cancelable: true,
        view: window
      });
      const mouseEnterEvent = new MouseEvent('mouseenter', { 
        bubbles: true, 
        cancelable: true,
        view: window
      });
      
      element.dispatchEvent(mouseOverEvent);
      element.dispatchEvent(mouseEnterEvent);
      
      // Also trigger on parent if it exists
      if (element.parentElement) {
        element.parentElement.dispatchEvent(mouseOverEvent);
      }
    }
  };

  const clickElement = async (element: HTMLElement, fast = false) => {
    if (fast) {
      // Fast click - move cursor quickly and click
      console.log('[Playback] Fast clicking element:', element);
      await moveCursorTo(element);
      await sleep(50); // Very brief wait
      window.dispatchEvent(new CustomEvent('playback:click'));
      await sleep(50);
      element.click();
      return;
    }
    
    console.log('[Playback] Moving cursor to element:', element);
    await moveCursorTo(element);
    await sleep(200); // Extra wait to see cursor movement
    console.log('[Playback] Clicking element');
    window.dispatchEvent(new CustomEvent('playback:click'));
    await sleep(100);
    element.click();
    await sleep(300);
  };

  const executeTypeText = async (step: any) => {
    // Clear existing text first
    setText('');
    await sleep(300);

    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textarea) {
      console.error('[Playback] Textarea not found');
      return;
    }

    await moveCursorTo(textarea);
    textarea.focus();

    // Type character by character with human-like pauses and cursor tracking
    const text = step.content || '';
    const baseSpeed = step.typingSpeed || 10;
    const rect = textarea.getBoundingClientRect();
    const startX = rect.left + 56 + 10; // Account for padding
    let currentY = rect.top + 88 + 10; // Start position with padding
    const lineHeight = 27; // Approximate line height based on font size
    let currentLineLength = 0;
    const maxLineLength = 65; // Approximate characters per line

    for (let i = 0; i < text.length; i++) {
      setText(text.substring(0, i + 1));
      
      const char = text[i];
      
      // Update cursor position to follow typing
      if (char === '\n') {
        // New line
        currentY += lineHeight;
        currentLineLength = 0;
      } else {
        currentLineLength++;
        // Wrap to next line if needed
        if (currentLineLength > maxLineLength) {
          currentY += lineHeight;
          currentLineLength = 0;
        }
      }
      
      // Update cursor position every few characters to follow typing
      if (i % 5 === 0) {
        const cursorX = startX + (currentLineLength * 8); // Approximate character width
        window.dispatchEvent(new CustomEvent('playback:moveCursor', {
          detail: { x: cursorX, y: currentY }
        }));
      }
      
      // Add random variation and pauses for punctuation
      let delay = baseSpeed;
      
      // Longer pause after punctuation
      if (char === '.' || char === '!' || char === '?') {
        delay = baseSpeed + Math.random() * 40 + 30;
      } else if (char === ',' || char === ';' || char === ':') {
        delay = baseSpeed + Math.random() * 20 + 15;
      } else if (char === '\n') {
        delay = baseSpeed + Math.random() * 30 + 20;
      } else {
        // Random variation in typing speed
        delay = baseSpeed + Math.random() * 4 - 2;
      }
      
      await sleep(delay);
    }
  };

  const executeClick = async (step: any) => {
    // Check if this is the save button click (step 8) - make it fast
    const isFastClick = step.findValue === 'Save annotation';
    
    let element: HTMLElement | null = null;

    if (step.findBy === 'text') {
      const elements = Array.from(document.querySelectorAll('button, a, [role="button"]'));
      element = elements.find(el => 
        el.textContent?.includes(step.findValue)
      ) as HTMLElement;
    } else if (step.findBy === 'ariaLabel') {
      element = document.querySelector(`[aria-label*="${step.findValue}"]`) as HTMLElement;
      console.log('[Playback] Found element by aria-label:', element, 'fast:', isFastClick);
    } else if (step.target) {
      element = document.querySelector(step.target) as HTMLElement;
    }

    if (element) {
      // Check if element is visible and not disabled
      const isVisible = element.offsetParent !== null;
      const isDisabled = element.hasAttribute('disabled');
      console.log('[Playback] Element status:', { isVisible, isDisabled, element, isFastClick });
      
      if (isVisible && !isDisabled) {
        await clickElement(element, isFastClick);
      } else {
        console.warn('[Playback] Element found but not clickable:', { isVisible, isDisabled });
        // Very brief wait if needed
        await sleep(50);
        await clickElement(element, isFastClick);
      }
    } else {
      console.error(`[Playback] Element not found for click:`, {
        findBy: step.findBy,
        findValue: step.findValue,
        target: step.target,
        stepName: step.name
      });
    }
  };

  const executeWaitForAnalysis = async () => {
    console.log('[Playback] Waiting for analysis to complete...');
    // Poll for annotations to appear
    let attempts = 0;
    const maxAttempts = 50; // 25 seconds max
    
    while (attempts < maxAttempts) {
      const annotations = document.querySelectorAll('[role="mark"]');
      if (annotations.length > 0) {
        console.log('[Playback] Analysis complete! Found', annotations.length, 'annotations');
        await sleep(1000); // Extra wait for rendering
        return;
      }
      await sleep(500);
      attempts++;
    }
    
    console.warn('[Playback] Analysis timeout - no annotations found');
  };

  const executeClickAnnotation = async (step: any) => {
    await sleep(500); // Wait for annotations to render

    // Find annotation by text content
    const annotations = Array.from(document.querySelectorAll('[role="mark"]'));
    console.log('[Playback] Looking for annotation, found', annotations.length, 'total annotations');
    
    // First, hover over previous annotations to show the active card swapping
    if (annotations.length > 0) {
      console.log('[Playback] Hovering over previous annotations first...');
      // Get first 2-3 annotations to hover over
      const previewAnnotations = annotations.slice(0, Math.min(3, annotations.length));
      for (const prevAnn of previewAnnotations) {
        await moveCursorTo(prevAnn, true); // Enable hover trigger
        await sleep(800); // Brief pause on each to see the card switch
      }
    }
    
    const annotation = annotations.find(el => {
      const matches = el.textContent?.includes(step.findValue);
      if (matches) {
        console.log('[Playback] Found matching annotation:', el.textContent?.substring(0, 50));
      }
      return matches;
    }) as HTMLElement;

    if (annotation) {
      await clickElement(annotation);
    } else {
      console.error('[Playback] Annotation not found:', step.findValue);
      console.log('[Playback] Available annotations:', annotations.map(a => a.textContent?.substring(0, 50)));
    }
  };

  const executeBrowserFlow = async () => {
    // Find and click globe icon
    await sleep(500);
    const globeButton = document.querySelector('button[aria-label="View reference"]') as HTMLElement;
    if (globeButton) {
      await clickElement(globeButton);
      await sleep(1200);

      // Click fullscreen/maximize button
      const maximizeButton = document.querySelector('button[aria-label="Enter fullscreen"]') as HTMLElement;
      if (maximizeButton) {
        await clickElement(maximizeButton);
        await sleep(1500);

        // Simulate scrolling visually - since iframe scrolling is blocked, just move cursor
        const iframe = document.querySelector('iframe') as HTMLIFrameElement;
        
        if (iframe) {
          console.log('[Playback] Simulating browser scroll with cursor movement');
          
          const iframeRect = iframe.getBoundingClientRect();
          const centerX = iframeRect.left + iframeRect.width / 2;
          const startY = iframeRect.top + iframeRect.height * 0.2;
          const midY = iframeRect.top + iframeRect.height * 0.5;
          const endY = iframeRect.top + iframeRect.height * 0.8;
          
          // Move cursor to start position
          window.dispatchEvent(new CustomEvent('playback:moveCursor', {
            detail: { x: centerX, y: startY }
          }));
          
          await sleep(500);
          
          // Simulate reading pattern - cursor moves down the page slowly
          console.log('[Playback] Simulating page reading scroll');
          for (let i = 0; i <= 20; i++) {
            const progress = i / 20;
            const y = startY + (endY - startY) * progress;
            // Add slight horizontal variation for natural movement
            const x = centerX + (Math.sin(i * 0.3) * 30);
            
            window.dispatchEvent(new CustomEvent('playback:moveCursor', {
              detail: { x, y }
            }));
            
            await sleep(100);
          }
          
          await sleep(1000); // Pause to "read"
          
          // Scroll back up slightly
          console.log('[Playback] Scrolling back up');
          for (let i = 0; i <= 8; i++) {
            const progress = i / 8;
            const y = endY - ((endY - midY) * progress);
            const x = centerX + (Math.sin(i * 0.3) * 30);
            
            window.dispatchEvent(new CustomEvent('playback:moveCursor', {
              detail: { x, y }
            }));
            
            await sleep(80);
          }
          
          await sleep(600); // Final pause
        }

        // Click close button
        const closeButton = document.querySelector('button[aria-label="Close"]') as HTMLElement;
        if (closeButton) {
          await clickElement(closeButton);
        }
      }
    }
  };

  const executeChatMessage = async (step: any) => {
    await sleep(500);
    
    // Find chat textarea
    const chatTextarea = document.querySelector('textarea[placeholder*="Reply"]') as HTMLTextAreaElement;
    if (!chatTextarea) {
      console.error('[Playback] Chat textarea not found');
      return;
    }

    await moveCursorTo(chatTextarea);
    chatTextarea.focus();

    // Type message character by character with proper React event
    const message = step.content || '';
    const speed = step.typingSpeed || 50;

    for (let i = 0; i < message.length; i++) {
      const char = message[i];
      const currentValue = message.substring(0, i + 1);
      
      // Use React's internal setter to update the value
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        'value'
      )?.set;
      
      if (nativeInputValueSetter) {
        nativeInputValueSetter.call(chatTextarea, currentValue);
      } else {
        chatTextarea.value = currentValue;
      }
      
      // Dispatch input event that React listens to
      const inputEvent = new Event('input', { bubbles: true });
      chatTextarea.dispatchEvent(inputEvent);
      
      await sleep(speed);
    }

    await sleep(500); // Brief wait for button to enable

    // Click send button
    const sendButton = document.querySelector('button[aria-label="Send message"]') as HTMLElement;
    if (sendButton) {
      console.log('[Playback] Send button found, disabled?', sendButton.hasAttribute('disabled'));
      await clickElement(sendButton);
      
      // Wait for Claude's response to complete before continuing
      console.log('[Playback] Waiting for Claude response...');
      await sleep(300); // Minimal initial wait
      
      // Simple and fast: just check for new Claude message to appear
      let attempts = 0;
      const maxAttempts = 40; // 8 seconds max
      const initialMessages = document.querySelectorAll('div.flex.justify-start').length;
      
      console.log('[Playback] Initial message count:', initialMessages);
      
      while (attempts < maxAttempts) {
        const currentMessages = document.querySelectorAll('div.flex.justify-start').length;
        
        if (currentMessages > initialMessages) {
          console.log('[Playback] New Claude message detected! Moving immediately!');
          break; // Move immediately - no buffer
        }
        
        await sleep(200); // Fast polling every 200ms
        attempts++;
      }
      
      if (attempts >= maxAttempts) {
        console.warn('[Playback] Timeout waiting for Claude response - continuing anyway');
      }
    } else {
      console.error('[Playback] Send button not found');
    }
  };

  const executeSavedTabFlow = async () => {
    // Click Saved tab
    const savedTab = Array.from(document.querySelectorAll('button'))
      .find(btn => btn.textContent?.includes('Saved')) as HTMLElement;
    
    if (savedTab) {
      await clickElement(savedTab);
      await sleep(1000);

      // Click on the saved annotation card - find the clickable div inside
      const savedCards = document.querySelectorAll('.saved-list-scroll > div');
      console.log('[Playback] Found saved cards:', savedCards.length);
      
      if (savedCards.length > 0) {
        // Find the clickable div inside the first card (with cursor-pointer class)
        const firstCardContainer = savedCards[0];
        const clickableDiv = firstCardContainer.querySelector('div.cursor-pointer') as HTMLElement;
        
        if (clickableDiv) {
          console.log('[Playback] Clicking saved card clickable div:', clickableDiv);
          await clickElement(clickableDiv);
          await sleep(1200); // Wait for chat history to expand
        } else {
          console.error('[Playback] Clickable div not found in card');
          // Try clicking the card container itself as fallback
          await clickElement(firstCardContainer as HTMLElement);
          await sleep(1200);
        }
      } else {
        console.error('[Playback] No saved cards found');
      }
    }
  };

  const executeEditText = async (step: any) => {
    // Click edit button
    const editButton = document.querySelector('button[aria-label="Edit text"]') as HTMLElement;
    if (editButton) {
      await clickElement(editButton);
      await sleep(800);

      // Find textarea
      const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
      if (textarea) {
        // Move cursor to textarea
        await moveCursorTo(textarea);
        await sleep(400);
        
        // Show click animation
        console.log('[Playback] Clicking textarea to show focus ring');
        window.dispatchEvent(new CustomEvent('playback:click'));
        await sleep(100);
        
        // Multiple attempts to focus the textarea
        console.log('[Playback] Focusing textarea - attempt 1');
        textarea.focus();
        await sleep(100);
        
        console.log('[Playback] Clicking textarea - attempt 2');
        textarea.click();
        await sleep(100);
        
        console.log('[Playback] Final focus');
        textarea.focus();
        
        // Force focus by setting tabindex if needed
        if (document.activeElement !== textarea) {
          console.log('[Playback] Force focusing textarea');
          textarea.setAttribute('tabindex', '0');
          textarea.focus();
        }
        
        console.log('[Playback] Current active element:', document.activeElement?.tagName);
        
        await sleep(1000); // Extra long wait to see the orange outline
        
        // Find the old quote in the text
        const currentText = textarea.value;
        const oldQuote = 'Fear isn\'t something you think about. It\'s something that thinks you.';
        const newQuote = step.content;
        
        const quoteStartIndex = currentText.indexOf(oldQuote);
        
        if (quoteStartIndex !== -1) {
          // Set cursor position to start of old quote
          textarea.setSelectionRange(quoteStartIndex, quoteStartIndex);
          await sleep(300);
          
          // Select the old quote by setting selection range
          textarea.setSelectionRange(quoteStartIndex, quoteStartIndex + oldQuote.length);
          
          // CRITICAL: Re-focus after selection to maintain orange outline
          textarea.focus();
          console.log('[Playback] Re-focused after selection, active element:', document.activeElement?.tagName);
          
          await sleep(500); // Show the selection
          
          // Use SAME cursor tracking as initial typing - accounts for line wrapping!
          const rect = textarea.getBoundingClientRect();
          const startX = rect.left + 56 + 10; // Same as initial typing
          const startY = rect.top + 88 + 10; // Same as initial typing
          const lineHeight = 27; // Same as initial typing
          const maxLineLength = 65; // Same as initial typing
          
          // Helper function: calculate Y position for any text position (like initial typing does)
          const getYPosition = (textUpToCursor: string): number => {
            let currentY = startY;
            let currentLineLength = 0;
            
            for (let i = 0; i < textUpToCursor.length; i++) {
              const char = textUpToCursor[i];
              
              if (char === '\n') {
                currentY += lineHeight;
                currentLineLength = 0;
              } else {
                currentLineLength++;
                if (currentLineLength > maxLineLength) {
                  currentY += lineHeight;
                  currentLineLength = 0;
                }
              }
            }
            
            return currentY;
          };
          
          // Calculate Y position for where the quote starts
          const textBeforeQuote = currentText.substring(0, quoteStartIndex);
          let currentY = getYPosition(textBeforeQuote);
          const cursorX = startX + 200; // Fixed X in middle
          
          // Move cursor to paragraph 3 area
          window.dispatchEvent(new CustomEvent('playback:moveCursor', {
            detail: { x: cursorX, y: currentY }
          }));
          await sleep(300);
          
          // Delete the selected text by backspacing (animate the deletion)
          console.log('[Playback] Deleting old quote...');
          
          // Maintain focus during deletion
          textarea.focus();
          
          // Count lines in old quote
          const oldQuoteLines = oldQuote.split('\n').length;
          
          for (let i = oldQuote.length; i > 0; i--) {
            const beforeQuote = currentText.substring(0, quoteStartIndex);
            const afterQuote = currentText.substring(quoteStartIndex + oldQuote.length);
            const partialOldQuote = oldQuote.substring(0, i - 1);
            const updatedValue = beforeQuote + partialOldQuote + afterQuote;
            
            // Update cursor Y position - use same tracking as initial typing
            if (i % 15 === 0) {
              const textUpToCursor = beforeQuote + partialOldQuote;
              currentY = getYPosition(textUpToCursor);
              window.dispatchEvent(new CustomEvent('playback:moveCursor', {
                detail: { x: cursorX, y: currentY }
              }));
            }
            
            // Use native setter
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
              window.HTMLTextAreaElement.prototype,
              'value'
            )?.set;
            
            if (nativeInputValueSetter) {
              nativeInputValueSetter.call(textarea, updatedValue);
            } else {
              textarea.value = updatedValue;
            }
            
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
            setText(updatedValue);
            
            // Periodically re-focus to maintain orange outline
            if (i % 30 === 0) {
              textarea.focus();
            }
            
            await sleep(20); // Fast deletion
          }
          
          // Reset Y to start of where new text will be
          currentY = getYPosition(textBeforeQuote);
          
          // Maintain focus before typing
          textarea.focus();
          console.log('[Playback] Re-focused before typing new quote');
          
          await sleep(300);
          
          // Now type the new quote with cursor tracking
          console.log('[Playback] Typing new quote...');
          const beforeQuote = currentText.substring(0, quoteStartIndex);
          const afterQuote = currentText.substring(quoteStartIndex + oldQuote.length);
          
          for (let i = 0; i < newQuote.length; i++) {
            const partialNewQuote = newQuote.substring(0, i + 1);
            const updatedValue = beforeQuote + partialNewQuote + afterQuote;
            
            // Update cursor Y position - use same tracking as initial typing
            if (i % 15 === 0 || newQuote[i] === '\n') {
              const textUpToCursor = beforeQuote + partialNewQuote;
              currentY = getYPosition(textUpToCursor);
              window.dispatchEvent(new CustomEvent('playback:moveCursor', {
                detail: { x: cursorX, y: currentY }
              }));
            }
            
            // Use native setter
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
              window.HTMLTextAreaElement.prototype,
              'value'
            )?.set;
            
            if (nativeInputValueSetter) {
              nativeInputValueSetter.call(textarea, updatedValue);
            } else {
              textarea.value = updatedValue;
            }
            
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
            setText(updatedValue);
            
            // Periodically re-focus to maintain orange outline
            if (i % 20 === 0) {
              textarea.focus();
            }
            
            await sleep(30); // Typing speed
          }
          
          // Final focus to ensure outline stays visible
          textarea.focus();
          console.log('[Playback] Final re-focus after typing complete');
          
          await sleep(1000);
        } else {
          console.error('[Playback] Old quote not found in textarea');
        }
      }
    }
  };

  const executeRestart = async () => {
    console.log('[Playback] Restarting loop - clearing text and reloading...');
    await sleep(2000); // Brief pause before restarting
    
    // Clear the text immediately to prevent glitch on reload
    setText('');
    await sleep(300); // Brief moment to show cleared state
    
    // Reload the page for clean restart
    window.location.reload();
  };

  return null; // This component doesn't render anything
}

