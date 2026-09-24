import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { AuthSideBanner } from '@/components/auth/AuthSideBanner';
import { WorkflowHighlight, AUTH_BANNER_HIGHLIGHTS, AUTH_BANNER_CONFIG } from '@/constants';

describe('AuthSideBanner Component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.clearAllTimers();
    });
    jest.useRealTimers();
  });

  it('renders correctly with default props and accessibility attributes', () => {
    render(<AuthSideBanner />);

    const asideElement = screen.getByRole('complementary', {
      name: /taskflow highlights and illustration/i,
    });
    expect(asideElement).toBeInTheDocument();
    expect(asideElement).toHaveClass('hidden', 'lg:flex', 'lg:w-1/2');

    // Branding badge
    expect(screen.getByText('TaskFlow Platform')).toBeInTheDocument();

    // Image alt text
    const image = screen.getByAltText(AUTH_BANNER_CONFIG.defaultImageAlt);
    expect(image).toBeInTheDocument();

    // Initial highlight tag and quote
    expect(screen.getByText(AUTH_BANNER_HIGHLIGHTS[0].tag)).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(AUTH_BANNER_HIGHLIGHTS[0].quote.substring(0, 30), 'i'))
    ).toBeInTheDocument();
  });

  it('navigates to next and previous slides when buttons are clicked', () => {
    render(<AuthSideBanner />);

    const nextButton = screen.getByRole('button', { name: /next highlight/i });
    const prevButton = screen.getByRole('button', {
      name: /previous highlight/i,
    });

    // Click Next
    fireEvent.click(nextButton);
    expect(screen.getByText(AUTH_BANNER_HIGHLIGHTS[1].tag)).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(AUTH_BANNER_HIGHLIGHTS[1].quote.substring(0, 30), 'i'))
    ).toBeInTheDocument();

    // Click Prev to return to first slide
    fireEvent.click(prevButton);
    expect(screen.getByText(AUTH_BANNER_HIGHLIGHTS[0].tag)).toBeInTheDocument();
  });

  it('allows clicking indicator tabs to jump to a specific slide', () => {
    render(<AuthSideBanner />);

    const slide3Tab = screen.getByRole('tab', {
      name: new RegExp(`slide 3: ${AUTH_BANNER_HIGHLIGHTS[2].tag}`, 'i'),
    });
    fireEvent.click(slide3Tab);

    expect(screen.getByText(AUTH_BANNER_HIGHLIGHTS[2].tag)).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(AUTH_BANNER_HIGHLIGHTS[2].metric as string, 'i'))
    ).toBeInTheDocument();
  });

  it('automatically advances slides on interval and pauses on hover', () => {
    render(<AuthSideBanner autoPlayInterval={3000} />);

    expect(screen.getByText(AUTH_BANNER_HIGHLIGHTS[0].tag)).toBeInTheDocument();

    // Advance timer by 3000ms
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(screen.getByText(AUTH_BANNER_HIGHLIGHTS[1].tag)).toBeInTheDocument();

    // Hover over banner to pause
    const banner = screen.getByRole('complementary');
    fireEvent.mouseEnter(banner);

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    // Should stay paused on slide 2
    expect(screen.getByText(AUTH_BANNER_HIGHLIGHTS[1].tag)).toBeInTheDocument();

    // Mouse leave to resume
    fireEvent.mouseLeave(banner);

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(screen.getByText(AUTH_BANNER_HIGHLIGHTS[2].tag)).toBeInTheDocument();
  });

  it('renders custom highlights and image properties when provided', () => {
    const customHighlights: WorkflowHighlight[] = [
      {
        id: 'custom-1',
        tag: 'Custom Feature',
        quote: 'Custom quote description for task management.',
        author: 'Custom Author',
        role: 'Custom Role',
        metric: '5x Boost',
      },
    ];

    render(
      <AuthSideBanner
        highlights={customHighlights}
        imageSrc="/custom-bg.jpg"
        imageAlt="Custom Banner"
      />
    );

    expect(screen.getByText('Custom Feature')).toBeInTheDocument();
    expect(screen.getByText(/Custom quote description for task management/i)).toBeInTheDocument();
    expect(screen.getByText('Custom Author')).toBeInTheDocument();
    expect(screen.getByText('5x Boost')).toBeInTheDocument();
    expect(screen.getByAltText('Custom Banner')).toBeInTheDocument();
  });

  it('falls back to the first highlight when the active index no longer exists after highlights shrink', () => {
    const twoHighlights: WorkflowHighlight[] = [
      {
        id: 'h1',
        tag: 'Tag One',
        quote: 'Quote one text for testing purposes.',
        author: 'Author One',
        role: 'Role One',
      },
      {
        id: 'h2',
        tag: 'Tag Two',
        quote: 'Quote two text for testing purposes.',
        author: 'Author Two',
        role: 'Role Two',
      },
    ];

    const { rerender } = render(<AuthSideBanner highlights={twoHighlights} />);

    fireEvent.click(screen.getByRole('button', { name: /next highlight/i }));
    expect(screen.getByText('Tag Two')).toBeInTheDocument();

    // Shrink the highlights array while activeIndex still points past its bounds
    rerender(<AuthSideBanner highlights={[twoHighlights[0]]} />);

    expect(screen.getByText('Author One')).toBeInTheDocument();
    expect(screen.getByText('Role One')).toBeInTheDocument();
  });
});
