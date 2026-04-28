import { useRef, useEffect, useState, forwardRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText as GSAPSplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, GSAPSplitText, useGSAP);

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  ease?: string;
  splitType?: 'chars' | 'words' | 'lines' | string;
  from?: object;
  to?: object;
  threshold?: number;
  rootMargin?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
  onLetterAnimationComplete?: () => void;
  showCallback?: boolean;
}

const SplitText = forwardRef<HTMLElement, SplitTextProps>(({
  text,
  className = '',
  delay = 50,
  duration = 1.25,
  ease = 'power3.out',
  splitType = 'chars',
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = '-100px',
  textAlign = 'center',
  tag = 'p',
  onLetterAnimationComplete
}: SplitTextProps, ref) => {
  const internalRef = useRef<HTMLElement>(null);
  const elementRef = (ref as React.RefObject<HTMLElement>) || internalRef;
  const animationCompletedRef = useRef(false);
  const onCompleteRef = useRef(onLetterAnimationComplete);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  // Keep callback ref updated
  useEffect(() => {
    onCompleteRef.current = onLetterAnimationComplete;
  }, [onLetterAnimationComplete]);

  useEffect(() => {
    if (!elementRef.current) return;
    if (document.fonts.status === 'loaded') {
      setFontsLoaded(true);
    } else {
      document.fonts.ready.then(() => {
        setFontsLoaded(true);
      });
    }
  }, []);

  useGSAP(
    () => {
      if (!elementRef.current || !text || !fontsLoaded) return;
      // Prevent re-animation if already completed
      if (animationCompletedRef.current) return;
      const el = elementRef.current;

      if ((el as any)._rbsplitInstance) {
        try {
          (el as any)._rbsplitInstance.revert();
        } catch (_) {
          /* noop */
        }
        (el as any)._rbsplitInstance = null;
      }

      const startPct = (1 - threshold) * 100;
      const marginMatch = /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(rootMargin);
      const marginValue = marginMatch ? parseFloat(marginMatch[1]) : 0;
      const marginUnit = marginMatch ? marginMatch[2] || 'px' : 'px';
      const sign =
        marginValue === 0
          ? ''
          : marginValue < 0
            ? `-=${Math.abs(marginValue)}${marginUnit}` 
            : `+=${marginValue}${marginUnit}`;
      const start = `top ${startPct}%${sign}`;

      let targets: any;
      const assignTargets = (self: any) => {
        if (splitType.includes('chars') && self.chars.length) targets = self.chars;
        if (!targets && splitType.includes('words') && self.words.length) targets = self.words;
        if (!targets && splitType.includes('lines') && self.lines.length) targets = self.lines;
        if (!targets) targets = self.chars || self.words || self.lines;
      };

      const splitInstance = new GSAPSplitText(el, {
        type: splitType,
        smartWrap: true,
        autoSplit: splitType === 'lines',
        linesClass: 'split-line',
        wordsClass: 'split-word',
        charsClass: 'split-char',
        reduceWhiteSpace: false,
        onSplit: (self: any) => {
          assignTargets(self);
          const tween = gsap.fromTo(
            targets,
            { ...from },
            {
              ...to,
              duration,
              ease,
              stagger: delay / 1000,
              scrollTrigger: {
                trigger: el,
                start,
                once: true,
                fastScrollEnd: true,
                anticipatePin: 0.4
              },
              onComplete: () => {
                animationCompletedRef.current = true;
                onCompleteRef.current?.();
              },
              willChange: 'transform, opacity',
              force3D: true
            }
          );
          return tween;
        }
      });

      (el as any)._rbsplitInstance = splitInstance;

      return () => {
        ScrollTrigger.getAll().forEach(st => {
          if (st.trigger === el) st.kill();
        });
        try {
          splitInstance.revert();
        } catch (_) {
          /* noop */
        }
        (el as any)._rbsplitInstance = null;
      };
    },
    {
      dependencies: [
        text,
        delay,
        duration,
        ease,
        splitType,
        JSON.stringify(from),
        JSON.stringify(to),
        threshold,
        rootMargin,
        fontsLoaded
      ],
      scope: elementRef
    }
  );

  const renderTag = () => {
    const style = {
      textAlign,
      overflow: 'hidden',
      display: 'inline-block',
      whiteSpace: 'normal',
      wordWrap: 'break-word',
      willChange: 'transform, opacity'
    } as React.CSSProperties;
    const classes = `split-parent ${className}`;

    const Tag = tag;
    
    if (Tag === 'h1') {
      return (
        <h1 ref={elementRef as any} style={style} className={classes}>
          {text}
        </h1>
      );
    } else if (Tag === 'h2') {
      return (
        <h2 ref={elementRef as any} style={style} className={classes}>
          {text}
        </h2>
      );
    } else if (Tag === 'h3') {
      return (
        <h3 ref={elementRef as any} style={style} className={classes}>
          {text}
        </h3>
      );
    } else if (Tag === 'h4') {
      return (
        <h4 ref={elementRef as any} style={style} className={classes}>
          {text}
        </h4>
      );
    } else if (Tag === 'h5') {
      return (
        <h5 ref={elementRef as any} style={style} className={classes}>
          {text}
        </h5>
      );
    } else if (Tag === 'h6') {
      return (
        <h6 ref={elementRef as any} style={style} className={classes}>
          {text}
        </h6>
      );
    } else if (Tag === 'span') {
      return (
        <span ref={elementRef as any} style={style} className={classes}>
          {text}
        </span>
      );
    } else if (Tag === 'div') {
      return (
        <div ref={elementRef as any} style={style} className={classes}>
          {text}
        </div>
      );
    } else {
      return (
        <p ref={elementRef as any} style={style} className={classes}>
          {text}
        </p>
      );
    }
  };
  return renderTag();
};

export default SplitText;
