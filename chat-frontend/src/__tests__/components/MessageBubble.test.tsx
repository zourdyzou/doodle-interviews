import { render, screen } from '@testing-library/react';

import { MessageBubble } from '@/components/chat/MessageBubble';

const mockMessage = {
  _id: '123',
  message: 'Hello world',
  author: 'John',
  createdAt: '2024-01-12T10:30:00.000Z',
};

describe('MessageBubble', () => {
  it('renders the message content', () => {
    render(<MessageBubble message={mockMessage} isOwn={false} />);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('shows author name for received messages', () => {
    render(<MessageBubble message={mockMessage} isOwn={false} />);
    expect(screen.getByText('John')).toBeInTheDocument();
  });

  it('hides author name for own messages', () => {
    render(<MessageBubble message={mockMessage} isOwn={true} />);
    expect(screen.queryByText('John')).not.toBeInTheDocument();
  });

  it('decodes HTML entities in message text', () => {
    const message = { ...mockMessage, message: "It&#39;s a test &amp; more" };
    render(<MessageBubble message={message} isOwn={false} />);
    expect(screen.getByText("It's a test & more")).toBeInTheDocument();
  });

  it('renders a formatted date', () => {
    render(<MessageBubble message={mockMessage} isOwn={false} />);
    // Check date parts separately to avoid timezone-dependent failures
    const time = screen.getByRole('time');
    expect(time).toBeInTheDocument();
    expect(time).toHaveAttribute('datetime', mockMessage.createdAt);
    expect(time.textContent).toMatch(/12 Jan 2024/);
  });

  it('has correct aria-label for accessibility', () => {
    render(<MessageBubble message={mockMessage} isOwn={false} />);
    expect(
      screen.getByRole('article', { name: 'Message from John' }),
    ).toBeInTheDocument();
  });
});