"use client";

import * as React from "react";
import { 
    Check, 
    ChevronsUpDown, 
    PlusCircle, 
    Trash2, 
    Pencil, 
    Download, 
    CalendarPlus 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerPortal,
  DrawerOverlay
} from "@/components/ui/drawer"
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import { useMissionsListStore } from "@/store/useMissionsListStore";
import { createMission, fetchMissionById, deleteMission, updateMission } from "@/config/clientApi";
import { useMissionStore } from "@/store/missionStore";
import { MISSION_STATUS_CONFIG } from "@/lib/config";
import { useTranslation } from "react-i18next";

// --- КОМПОНЕНТ ДИАЛОГА (СОЗДАНИЕ И РЕДАКТИРОВАНИЕ) ---
interface MissionEditProps {
    id: string;
    name: string;
    description: string;
}

const MissionFormDialog = ({ 
    setOpenPopover, 
    missionToEdit 
}: { 
    setOpenPopover: (open: boolean) => void,
    missionToEdit?: MissionEditProps 
}) => {
    const {t} = useTranslation();
    const isEditing = !!missionToEdit;
    const [name, setName] = React.useState(missionToEdit?.name || '');
    const [description, setDescription] = React.useState(missionToEdit?.description || ''); 
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [open, setDialogOpen] = React.useState(false);

    const addMission = useMissionsListStore(s => s.addMission);
    const updateMissionNameInStore = useMissionsListStore(s => s.updateMissionName);

    const handleSave = async () => {
        if (!name.trim()) {
            toast.warning(t('missionNameRequired'));
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            if (isEditing && missionToEdit) {
                await updateMission(missionToEdit.id, undefined, name.trim());
                updateMissionNameInStore(missionToEdit.id, name.trim());
                toast.success(t('missionRenamed'));
            } else {
                const newMissionFromServer = await createMission(name.trim(), description.trim()); 
                addMission({
                    ...newMissionFromServer,
                    name: name.trim(),
                    description: description.trim(),
                    status: newMissionFromServer.status || 'DRAFT',
                    points: 0
                });
                
                toast.success(t('missionCreated'));
            }
            setDialogOpen(false);
            setOpenPopover(false); 
        } catch (err: any) {
            setError(err.message || t('missionSaveError'));
        } finally {
            setIsLoading(false);
        }
    };
    
    const stopPropagation = (e: React.MouseEvent | React.PointerEvent | React.KeyboardEvent) => {
        e.stopPropagation();
    };

    return (
        <Dialog open={open} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            {isEditing ? (
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 hover:text-white hover:bg-teal-400/20"
                    onClick={stopPropagation} 
                    onPointerDown={stopPropagation}
                    onKeyDown={stopPropagation}
                >
                    <Pencil className="h-4 w-4 text-teal-500 " />
                </Button>
            ) : (
                <Button 
                    variant="ghost" 
                    className="w-full justify-start text-sm hover:bg-teal-400/35"
                    onClick={() => setDialogOpen(true)}
                >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {t('createM')}
                </Button>
            )}
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-[425px] bg-neutral-800/75 backdrop-blur-xs border-neutral-100/35 rounded-lg text-white z-[1000]"
             onClick={stopPropagation}
             onPointerDown={stopPropagation}
          >
            <DialogHeader>
              <DialogTitle>{isEditing ? t('editM') : t('createM')}</DialogTitle>
              <DialogDescription className="text-neutral-300">
                {isEditing ? t('editMdesc') : t('createMdesc')}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right text-neutral-300">{t('name')}</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="col-span-3 bg-neutral-900/50 border-neutral-100/35 text-white"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right text-neutral-300">{t('descript')}</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="col-span-3 bg-neutral-900/50 border-neutral-100/35 text-white"
                />
              </div>
               {error && <div className="text-red-400 text-sm text-center col-span-4">{error}</div>}
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>{t('cancel')}</Button>
              <Button className="bg-teal-600" type="submit" onClick={handleSave} disabled={isLoading}>
                  {isLoading ? t('saving') : t('save')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
};

const DeleteMissionDialog = ({ 
    missionId, 
    missionName, 
    onDeleteConfirm 
}: { 
    missionId: string, 
    missionName: string, 
    onDeleteConfirm: (id: string) => void 
}) => {
    const {t} = useTranslation();
    
    const stopPropagation = (e: React.MouseEvent | React.PointerEvent | React.KeyboardEvent) => {
        e.stopPropagation();
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-neutral-400 hover:text-red-400 hover:bg-red-900/20"
                    onClick={stopPropagation}
                    onPointerDown={stopPropagation}
                    onKeyDown={stopPropagation}
                >
                    <Trash2 className="h-4 w-4 text-red-500 group-hover:text-red-500" />
                </Button>
                
            </AlertDialogTrigger>
            <AlertDialogContent 
                className="sm:max-w-[425px] bg-neutral-800/75 backdrop-blur-xs border-neutral-100/35 rounded-lg text-white z-[1000]"
                onClick={stopPropagation}
                onPointerDown={stopPropagation}
            >
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('delM')}</AlertDialogTitle>
                    <AlertDialogDescription className="text-neutral-300">
                        {t('delMdesc')} <span className="text-white font-bold">{missionName}</span>?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={stopPropagation}>{t('cancel')}</AlertDialogCancel>
                    <AlertDialogAction 
                        className="bg-red-700 hover:bg-red-600"
                        onClick={(e) => {
                            stopPropagation(e);
                            onDeleteConfirm(missionId);
                        }}
                    >
                        {t('del')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

// --- ГЛАВНЫЙ КОМПОНЕНТ ---
// --- ГЛАВНЫЙ КОМПОНЕНТ ---
export function MissionSelector() {
  const { t } = useTranslation();
  const [open, setOpen] = React.useState(false);
  const [openDesktop, setOpenDesktop] = React.useState(false);
  const [openMobile, setOpenMobile] = React.useState(false);
  const isLoading = useMissionsListStore((s) => s.isLoading);

  const missions = useMissionsListStore((s) => s.missions);
  const activeMissionId = useMissionsListStore((s) => s.activeMissionId);
  const setActiveMissionId = useMissionsListStore((s) => s.setActiveMissionId);
  const removeMissionFromStore = useMissionsListStore((s) => s.removeMission);
  const setMission = useMissionStore((s) => s.setMission);

  const selectedLabel = missions.find((m) => m.id === activeMissionId)?.name || t("selectM");

  const handleDelete = async (id: string) => {
    try {
      await deleteMission(id);
      toast.success(t("missionDeleted"));
      removeMissionFromStore(id);
      if (activeMissionId === id) setActiveMissionId(null);
    } catch {
      toast.error(t("missionDeleteError"));
    }
  };

  const handleExport = (e: React.MouseEvent, mission: any) => {
    e.stopPropagation();
    toast.info(`Exporting ${mission.name}...`);
  };

  const handleAddToPlan = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    toast.info("Opening calendar...");
  };

  const MissionListContent = (
    <Command className="bg-transparent text-white">
      <CommandInput placeholder={t("findM")} className="placeholder:text-neutral-500"  />
      <CommandList className="max-h-100 py-2 overflow-hidden">
        <ScrollArea className="h-100 w-full">
          <CommandEmpty>{t("notfound")}</CommandEmpty>
          <CommandGroup>
            {missions.map((m) => {
              const statusCfg = MISSION_STATUS_CONFIG[m.status] || MISSION_STATUS_CONFIG.DRAFT;
              const StatusIcon = statusCfg.icon;

              return (
                <CommandItem
                  key={m.id}
                  value={m.name}
                  onSelect={() => {
                    setActiveMissionId(m.id);
                    setOpenDesktop(false);
                    setOpenMobile(false);
                    fetchMissionById(m.id).then((fullMission) => {
                      let oldData = fullMission.missionData || {};
                      if (typeof oldData === 'string') {
                          try { oldData = JSON.parse(oldData); } catch(e) { oldData = {}; }
                      }

                      setMission({
                          ...fullMission,
                          missionData: { 
                              ...oldData,
                              points: oldData.points || []
                          },
                      });
                  });
                  }}
                  className={cn(
                    "flex flex-col items-start p-2 mb-1 mr-2 mx-1 rounded-md cursor-pointer transition-all border border-transparent",
                    activeMissionId === m.id ? "bg-teal-400/15" : ""
                  )}
                >
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center">
                      {activeMissionId === m.id && (
                        <Check
                          className={cn(
                            "h-4 w-4 shrink-0 text-teal-400 mr-0.5",
                            activeMissionId === m.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                      )}
                      <span className="text-white">{m.name}</span>
                    </div>

                    <div className="flex items-center gap-0.5 shrink-0 ml-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 hover:text-white hover:bg-blue-900/20"
                        onClick={(e) => handleExport(e, m)}
                      >
                        <Download className="h-4 w-4 text-blue-400 hover:text-blue-300" />
                      </Button>

                      <MissionFormDialog
                        setOpenPopover={setOpen}
                        missionToEdit={{
                          id: m.id,
                          name: m.name,
                          description: m.description || "",
                        }}
                      />

                      <DeleteMissionDialog
                        missionId={m.id}
                        missionName={m.name}
                        onDeleteConfirm={handleDelete}
                      />
                    </div>
                  </div>

                  {m.description && (
                    <p className="text-xs text-neutral-400 line-clamp-2">{m.description}</p>
                  )}

                  <div className="flex w-full items-center justify-between">
                    <div className="flex gap-1.5">
                      <Badge
                        variant="default"
                        className="bg-neutral-700 px-1.5 py-0 h-5 font-normal text-neutral-200 border-neutral-200/50"
                      >
                        {t("points")} {m.points || 0}
                      </Badge>
                      <Badge
                        className={cn(
                            "px-1.5 py-0 h-5 font-normal border",
                            statusCfg.color
                        )}
                        >
                        {t(m.status.toLowerCase())}
                    </Badge>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-neutral-400 gap-1"
                      onClick={(e) => handleAddToPlan(e, m.id)}
                    >
                      <CalendarPlus className="h-4 w-4 text-neutral-400" />
                      {t("addToPlan") || "Add to Plan"}
                    </Button>
                  </div>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </ScrollArea>
      </CommandList>
    </Command>
    
  );

  return (
    <>
      {/* Десктоп Popover */}
      <div className="hidden sm:block w-full xl:max-w-[340px]">
        <Popover open={openDesktop} onOpenChange={setOpenDesktop}>
          <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    disabled={isLoading}
                    aria-expanded={open}
                    className="w-full xl:max-w-[340px] justify-between pl-3 bg-neutral-900/50 border-neutral-100/35 text-white hover:text-white hover:bg-neutral-700/75"
                >
                    <span className="truncate">{selectedLabel}</span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] xl:w-[340px] p-0 z-[1001] bg-neutral-800/75 backdrop-blur-xs border border-neutral-100/35 rounded-lg text-white">
            {MissionListContent}
            <div className="h-px bg-neutral-100/35 my-1" />
            <div className="p-1">
                <MissionFormDialog setOpenPopover={setOpen} />
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Мобильный Drawer */}
      <div className="block sm:hidden w-full h-full xl:max-w-[340px]">
        <Drawer open={openMobile} onOpenChange={setOpenMobile}>
          <DrawerTrigger asChild>
            <Button
              variant="outline"
              className="w-full xl:max-w-[340px] justify-between pl-3 bg-neutral-900/50 border-neutral-100/35 text-white hover:text-white hover:bg-neutral-700/75"
            >
              <span className="truncate">{selectedLabel}</span>
              <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
            </Button>
          </DrawerTrigger>

          <DrawerPortal>
            <DrawerOverlay className="z-[1100] bg-black/60 backdrop-blur-sm" />
            <DrawerContent className="bg-neutral-800/75 text-white border border-neutral-100/35 p-0 w-full max-w-full z-[1100] backdrop-blur-xs">
                {MissionListContent}
            </DrawerContent>
          </DrawerPortal>
        </Drawer>
      </div>
    </>
  );
}