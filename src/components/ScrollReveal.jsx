import PropTypes from 'prop-types';
import { useInView } from 'react-intersection-observer';

export default function ScrollReveal({
  children,
  className = '',
  delay = 0,
  as: Component = 'div',
  threshold = 0.12,
  ...props
}) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold,
    rootMargin: '-30px 0px',
  });

  return (
    <Component
      ref={ref}
      className={`scroll-reveal-item ${inView ? 'is-revealed' : ''} ${className}`}
      style={{
        '--reveal-delay': `${delay}ms`,
      }}
      {...props}
    >
      {children}
    </Component>
  );
}

ScrollReveal.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  delay: PropTypes.number,
  as: PropTypes.elementType,
  threshold: PropTypes.number,
};
