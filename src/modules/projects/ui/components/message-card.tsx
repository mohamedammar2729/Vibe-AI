import { Card } from '@/components/ui/card';
import { Fragment, MessageRole, MessageType } from '@/generated/prisma';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ChevronRightIcon, Code2Icon } from 'lucide-react';
import Image from 'next/image';

interface UserMessageProps {
  content: string;
}

const UserMessage = ({ content }: UserMessageProps) => {
  return (
    <div className='flex justify-end pb-4 pr-2 pl-10'>
      <Card className='rounded-lg bg-muted p-3 shadow-none border-none max-w-[80%] break-words'>
        {content}
      </Card>
    </div>
  );
};

interface FragmentCardProps {
  Fragment: Fragment;
  isActiveFragment: boolean;
  onFragmentClick: (Fragment: Fragment) => void;
}

export function FragmentCard({
  Fragment,
  isActiveFragment,
  onFragmentClick,
}: FragmentCardProps) {
  return (
    <button
      className={cn(
        'flex items-start gap-2 border rounded-lg bg-muted w-fit p-3 hover:bg-secondary transition-colors',
        isActiveFragment &&
          'bg-primary text-primary-foreground border-primary hover:bg-primary'
      )}
      onClick={() => onFragmentClick(Fragment)}
    >
      <Code2Icon className='size-4 mt-0.5' />
      <div className='flex flex-col flex-1'>
        <span className='text-sm font-medium line-clamp-1'>
          {Fragment.title}
        </span>
        <span className='text-sm'>Preview</span>
      </div>
      <div className='flex items-center justify-center mt-0.5'>
        <ChevronRightIcon className='size-4' />
      </div>
    </button>
  );
}

interface AssistantMessageProps {
  content: string;
  Fragment: Fragment | null;
  createdAt: Date;
  isActiveFragment: boolean;
  onFragmentClick: (Fragment: Fragment) => void;
  type: MessageType;
}

export default function AssistantMessage({
  content,
  Fragment,
  createdAt,
  isActiveFragment,
  onFragmentClick,
  type,
}: AssistantMessageProps) {
  return (
    <div
      className={cn(
        'flex flex-col group px-2 pb-4',
        type === 'ERROR' && 'text-red-700 dark:text-red-500'
      )}
    >
      <div className='flex items-center gap-2 pl-2 mb-2'>
        <Image
          src='/logo.svg'
          alt='Vibe'
          width={18}
          height={18}
          className='shrink-0'
        />
        <span className='text-sm font-medium'>Vibe</span>
        <span className='text-xs mt-0.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100'>
          {format(createdAt, "HH:mm 'on' MMM dd, yyyy")}
        </span>
      </div>
      <div className='pl-8.5 flex flex-col gap-y-4'>
        <span>{content}</span>
        {Fragment && type === 'RESULT' && (
          <FragmentCard
            Fragment={Fragment}
            onFragmentClick={onFragmentClick}
            isActiveFragment={isActiveFragment}
          />
        )}
      </div>
    </div>
  );
}

interface MessageCardProps {
  content: string;
  role: MessageRole;
  Fragment: Fragment | null;
  createdAt: Date;
  isActiveFragment: boolean;
  onFragmentClick: (Fragment: Fragment) => void;
  type: MessageType;
}

export function MessageCard({
  content,
  role,
  Fragment,
  createdAt,
  isActiveFragment,
  onFragmentClick,
  type,
}: MessageCardProps) {
  if (role == 'ASSISTANT') {
    return (
      <AssistantMessage
        content={content}
        Fragment={Fragment}
        createdAt={createdAt}
        isActiveFragment={isActiveFragment}
        onFragmentClick={onFragmentClick}
        type={type}
      />
    );
  }
  return <UserMessage content={content} />;
}
