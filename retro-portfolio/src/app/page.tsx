import Terminal from '@/components/Terminal';
import { terminalData } from './data';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-black">
      <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {terminalData.map((term, index) => (
            <Terminal key={index} title={term.title}>
              <div>
                {term.content.map((line, i) => (
                  <p key={i} className="[&:not(:first-child)]:mt-2">
                    <span className="text-green-500 mr-2">$</span>
                    {line}
                  </p>
                ))}
              </div>
            </Terminal>
          ))}
        </div>
      </div>
    </main>
  );
}
