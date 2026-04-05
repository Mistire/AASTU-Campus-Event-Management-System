import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReactNode } from "react";

interface Tab {
  value: string;
  label: string;
  content: ReactNode;
}

interface TabsControllerProps {
  tabs: Tab[];
  defaultValue?: string;
  className?: string;
  listClassName?: string;
  triggerClassName?: string;
  contentClassName?: string;
}

export const TabsController = ({
  tabs,
  defaultValue,
  className,
  listClassName,
  triggerClassName,
  contentClassName,
}: TabsControllerProps) => {
  return (
    <Tabs defaultValue={defaultValue ?? tabs[0]?.value} className={className}>
      <TabsList className={listClassName}>
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className={triggerClassName}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent
          key={tab.value}
          value={tab.value}
          className={contentClassName ?? "mt-0"}
        >
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
};
