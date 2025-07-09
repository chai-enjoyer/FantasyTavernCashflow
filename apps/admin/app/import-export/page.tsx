'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Download, Upload, FileJson, ChevronDown, ChevronUp, Users, Layers, Settings, BookOpen, Lightbulb, Code, Image, X, Plus, Check, Search, CheckCircle, AlertCircle } from 'lucide-react';
import { getAllCards, getAllNPCs, getGameConfig, batchImportGameData, processImportFile, validateImportData, generateImportSummary, uploadNPCImages, validateImageFile, NPCImageUrls, createNPC, updateNPC, getNPC } from '@repo/firebase';
import { Card, NPC, GameConfig, NPCClass } from '@repo/shared';

interface GameContentExport {
  version: string;
  timestamp: string;
  cards?: Card[];
  npcs?: NPC[];
  config?: GameConfig | null;
}

type ExportType = 'all' | 'cards' | 'npcs' | 'config';
type SectionType = 'export' | 'import' | 'template' | 'guide' | 'imageUpload' | null;

interface ImageUploadState {
  npcId: string;
  selectedNpcId?: string;
  newNpcName?: string;
  newNpcClass?: NPCClass;
  isNewNpc: boolean;
  neutral?: File;
  positive?: File;
  negative?: File;
  uploadedUrls?: NPCImageUrls;
  uploading: boolean;
  error?: string;
  success?: string;
  npcSaved?: boolean;
}

export default function ImportExportPage() {
  const router = useRouter();
  const [exporting, setExporting] = useState<ExportType | null>(null);
  const [importing, setImporting] = useState(false);
  const [importPreview, setImportPreview] = useState<string | null>(null);
  const [importData, setImportData] = useState<any>(null);
  const [activeSection, setActiveSection] = useState<SectionType>('export');
  const [existingNPCs, setExistingNPCs] = useState<NPC[]>([]);
  const [loadingNPCs, setLoadingNPCs] = useState(false);
  const [imageUpload, setImageUpload] = useState<ImageUploadState>({
    npcId: '',
    isNewNpc: false,
    uploading: false
  });
  const [npcSearchTerm, setNpcSearchTerm] = useState('');
  const [showNpcDropdown, setShowNpcDropdown] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleExport = async (type: ExportType) => {
    setExporting(type);
    try {
      let exportData: GameContentExport = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
      };

      // Fetch only what's needed
      if (type === 'all' || type === 'cards') {
        exportData.cards = await getAllCards();
      }
      if (type === 'all' || type === 'npcs') {
        exportData.npcs = await getAllNPCs();
      }
      if (type === 'all' || type === 'config') {
        exportData.config = await getGameConfig();
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fantasy-tavern-${type}-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Не удалось экспортировать данные');
    } finally {
      setExporting(null);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const rawData = JSON.parse(text);

      // Process and validate the import file
      const processedData = processImportFile(rawData);
      const validation = validateImportData(processedData);

      if (!validation.valid) {
        alert(`Ошибка проверки:\n${validation.errors.join('\n')}`);
        event.target.value = '';
        return;
      }

      // Generate preview
      const summary = generateImportSummary(processedData);
      setImportPreview(summary);
      setImportData(processedData);
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Не удалось обработать файл. Проверьте формат файла.');
    } finally {
      event.target.value = '';
    }
  };

  const handleImport = async () => {
    if (!importData) return;

    setImporting(true);
    try {
      const result = await batchImportGameData(importData);
      
      if (result.success) {
        alert(`Импорт успешно завершён!\n\nИмпортировано:\n- ${result.details.cardsImported} карт\n- ${result.details.npcsImported} НПС\n- Конфигурация: ${result.details.configUpdated ? 'Обновлена' : 'Не изменена'}`);
        setImportPreview(null);
        setImportData(null);
      } else {
        alert(`Ошибка импорта:\n${result.errors.join('\n')}`);
      }
    } catch (error) {
      console.error('Error importing data:', error);
      alert('Не удалось импортировать данные');
    } finally {
      setImporting(false);
    }
  };

  const handleCancelImport = () => {
    setImportPreview(null);
    setImportData(null);
  };

  const toggleSection = (section: SectionType) => {
    setActiveSection(activeSection === section ? null : section);
    if (section === 'imageUpload' && activeSection !== 'imageUpload') {
      loadExistingNPCs();
    }
  };

  const loadExistingNPCs = async () => {
    if (existingNPCs.length > 0) return; // Already loaded
    
    setLoadingNPCs(true);
    try {
      const npcs = await getAllNPCs();
      setExistingNPCs(npcs);
    } catch (error) {
      console.error('Error loading NPCs:', error);
      setImageUpload(prev => ({ ...prev, error: 'Не удалось загрузить НПС. Пожалуйста, попробуйте снова.' }));
    } finally {
      setLoadingNPCs(false);
    }
  };

  // Filter NPCs based on search term
  const filteredNPCs = existingNPCs.filter(npc => {
    const searchLower = npcSearchTerm.toLowerCase();
    return (
      npc.name.toLowerCase().includes(searchLower) ||
      npc.id.toLowerCase().includes(searchLower) ||
      npc.class.toLowerCase().includes(searchLower)
    );
  });

  // Handle clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNpcDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const npcClasses: NPCClass[] = [
    'commoner', 'merchant', 'noble', 'adventurer', 'criminal', 'guard', 'cleric', 'mage', 'royal', 'crime_boss', 'dragon',
    'bard', 'alchemist', 'dwarf', 'elf', 'halfling', 'orc', 'vampire', 'pirate', 'monk', 'witch', 'knight',
    'necromancer', 'barbarian', 'artisan', 'scholar', 'blacksmith', 'hunter', 'sailor', 'healer', 'beggar',
    'artist', 'official', 'mystic'
  ];

  const generateNPCId = (name: string, npcClass: NPCClass): string => {
    const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
    return `${npcClass}_${cleanName}`;
  };

  const validateNPCId = (id: string): boolean => {
    // Allow both Firebase IDs (alphanumeric) and readable format (class_name)
    const firebasePattern = /^[a-zA-Z0-9]{15,25}$/; // Firebase auto-generated IDs
    const readablePattern = /^[a-z]+_[a-z0-9_]+$/; // Readable format: class_name
    return firebasePattern.test(id) || readablePattern.test(id);
  };

  const handleNPCSelection = (npcId: string) => {
    if (npcId === 'new') {
      setImageUpload(prev => ({ 
        ...prev, 
        selectedNpcId: undefined,
        npcId: '',
        isNewNpc: true,
        newNpcName: '',
        newNpcClass: undefined,
        error: undefined,
        success: undefined
      }));
    } else {
      setImageUpload(prev => ({ 
        ...prev, 
        selectedNpcId: npcId,
        npcId: npcId,
        isNewNpc: false,
        newNpcName: '',
        newNpcClass: undefined,
        error: undefined,
        success: undefined
      }));
    }
  };

  const handleNewNPCNameChange = (name: string) => {
    setImageUpload(prev => {
      const newState = { ...prev, newNpcName: name };
      // For new NPCs, we'll use the generated ID for image upload paths
      if (name && prev.newNpcClass) {
        newState.npcId = generateNPCId(name, prev.newNpcClass);
      }
      return newState;
    });
  };

  const handleNewNPCClassChange = (npcClass: NPCClass) => {
    setImageUpload(prev => {
      const newState = { ...prev, newNpcClass: npcClass };
      // For new NPCs, we'll use the generated ID for image upload paths
      if (prev.newNpcName && npcClass) {
        newState.npcId = generateNPCId(prev.newNpcName, npcClass);
      }
      return newState;
    });
  };

  const handleImageSelect = (type: 'neutral' | 'positive' | 'negative', file: File | undefined) => {
    if (file) {
      try {
        validateImageFile(file);
        setImageUpload(prev => ({ ...prev, [type]: file, error: undefined }));
      } catch (error: any) {
        setImageUpload(prev => ({ ...prev, error: error.message }));
      }
    } else {
      setImageUpload(prev => ({ ...prev, [type]: undefined }));
    }
  };

  const handleUploadImages = async () => {
    // Validate NPC selection/creation
    if (imageUpload.isNewNpc) {
      if (!imageUpload.newNpcName?.trim()) {
        setImageUpload(prev => ({ ...prev, error: 'Пожалуйста, введите имя для нового НПС' }));
        return;
      }
      if (!imageUpload.newNpcClass) {
        setImageUpload(prev => ({ ...prev, error: 'Пожалуйста, выберите класс для нового НПС' }));
        return;
      }
    } else {
      if (!imageUpload.selectedNpcId && !imageUpload.npcId.trim()) {
        setImageUpload(prev => ({ ...prev, error: 'Пожалуйста, выберите существующего НПС или создайте нового' }));
        return;
      }
    }

    if (!imageUpload.npcId.trim()) {
      setImageUpload(prev => ({ ...prev, error: 'Требуется ID НПС' }));
      return;
    }

    // Validate NPC ID format
    if (!validateNPCId(imageUpload.npcId)) {
      setImageUpload(prev => ({ ...prev, error: 'Неверный формат ID НПС. Используйте Firebase ID или читаемый формат (класс_имя)' }));
      return;
    }

    if (!imageUpload.neutral && !imageUpload.positive && !imageUpload.negative) {
      setImageUpload(prev => ({ ...prev, error: 'Пожалуйста, выберите хотя бы одно изображение для загрузки' }));
      return;
    }

    setImageUpload(prev => ({ ...prev, uploading: true, error: undefined, success: undefined }));

    try {
      // Upload images first
      const urls = await uploadNPCImages(imageUpload.npcId, {
        neutral: imageUpload.neutral,
        positive: imageUpload.positive,
        negative: imageUpload.negative
      });

      // Now create or update the NPC with the new URLs
      if (imageUpload.isNewNpc) {
        // Create new NPC
        const newNPC: Omit<NPC, 'id' | 'createdAt' | 'updatedAt'> = {
          name: imageUpload.newNpcName!.trim(),
          class: imageUpload.newNpcClass!,
          wealth: 3, // Default wealth level
          reliability: 80, // Default reliability
          portraits: {
            neutral: urls.neutral || '',
            positive: urls.positive || '',
            negative: urls.negative || ''
          },
          description: `Персонаж класса ${imageUpload.newNpcClass}`
        };

        // Use the generated readable ID
        const newNpcId = await createNPC(newNPC, imageUpload.npcId);
        
        // The ID should remain the same as the generated one
        console.log('Created NPC with ID:', newNpcId);
        
        // Refresh the NPC list
        const updatedNPCs = await getAllNPCs();
        setExistingNPCs(updatedNPCs);
        
        setImageUpload(prev => ({ 
          ...prev, 
          uploadedUrls: urls, 
          uploading: false,
          neutral: undefined,
          positive: undefined,
          negative: undefined,
          success: `Новый НПС "${imageUpload.newNpcName}" успешно создан с загруженными изображениями!`,
          npcSaved: true
        }));
      } else {
        // Update existing NPC with new portrait URLs
        const npcIdToUpdate = imageUpload.npcId || imageUpload.selectedNpcId!;
        console.log('Updating NPC with ID:', npcIdToUpdate);
        
        const existingNPC = await getNPC(npcIdToUpdate);
        if (existingNPC) {
          const updatedPortraits = {
            neutral: urls.neutral || existingNPC.portraits.neutral,
            positive: urls.positive || existingNPC.portraits.positive,
            negative: urls.negative || existingNPC.portraits.negative
          };

          await updateNPC(npcIdToUpdate, {
            portraits: updatedPortraits
          });

          // Refresh the NPC list
          const updatedNPCs = await getAllNPCs();
          setExistingNPCs(updatedNPCs);

          setImageUpload(prev => ({ 
            ...prev, 
            uploadedUrls: urls, 
            uploading: false,
            neutral: undefined,
            positive: undefined,
            negative: undefined,
            success: `НПС "${existingNPC.name}" успешно обновлён с новыми изображениями!`,
            npcSaved: true
          }));
        } else {
          throw new Error('НПС не найден');
        }
      }
    } catch (error: any) {
      setImageUpload(prev => ({ 
        ...prev, 
        uploading: false, 
        error: error.message || 'Не удалось загрузить изображения и сохранить НПС' 
      }));
    }
  };

  const resetImageUpload = () => {
    setImageUpload({
      npcId: '',
      selectedNpcId: undefined,
      newNpcName: '',
      newNpcClass: undefined,
      isNewNpc: false,
      uploading: false,
      uploadedUrls: undefined,
      error: undefined,
      success: undefined,
      npcSaved: false
    });
    setNpcSearchTerm('');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Импорт/Экспорт</h1>

        <div className="space-y-4">
          {/* Export Section */}
          <div className="admin-card">
            <button
              onClick={() => toggleSection('export')}
              className="w-full flex items-center justify-between p-4 hover:bg-admin-bg/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Download className="w-6 h-6 text-admin-primary" />
                <h2 className="text-xl font-semibold">Экспорт данных</h2>
              </div>
              {activeSection === 'export' ? <ChevronUp /> : <ChevronDown />}
            </button>
            
            {activeSection === 'export' && (
              <div className="p-4 pt-0 space-y-3">
                <p className="text-gray-400 mb-4">Экспортируйте игровой контент в JSON файлы для резервного копирования или переноса.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    onClick={() => handleExport('all')}
                    disabled={exporting !== null}
                    className="admin-button flex items-center justify-center gap-2"
                  >
                    <FileJson className="w-4 h-4" />
                    {exporting === 'all' ? 'Экспорт...' : 'Экспортировать всё'}
                  </button>
                  
                  <button
                    onClick={() => handleExport('cards')}
                    disabled={exporting !== null}
                    className="admin-button flex items-center justify-center gap-2"
                  >
                    <Layers className="w-4 h-4" />
                    {exporting === 'cards' ? 'Экспорт...' : 'Только карты'}
                  </button>
                  
                  <button
                    onClick={() => handleExport('npcs')}
                    disabled={exporting !== null}
                    className="admin-button flex items-center justify-center gap-2"
                  >
                    <Users className="w-4 h-4" />
                    {exporting === 'npcs' ? 'Экспорт...' : 'Только НПС'}
                  </button>
                  
                  <button
                    onClick={() => handleExport('config')}
                    disabled={exporting !== null}
                    className="admin-button flex items-center justify-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    {exporting === 'config' ? 'Экспорт...' : 'Только конфигурация'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Import Section */}
          <div className="admin-card">
            <button
              onClick={() => toggleSection('import')}
              className="w-full flex items-center justify-between p-4 hover:bg-admin-bg/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Upload className="w-6 h-6 text-admin-primary" />
                <h2 className="text-xl font-semibold">Импорт данных</h2>
              </div>
              {activeSection === 'import' ? <ChevronUp /> : <ChevronDown />}
            </button>
            
            {activeSection === 'import' && (
              <div className="p-4 pt-0">
                <p className="text-gray-400 mb-4">Импортируйте карты, НПС и конфигурацию из JSON файла.</p>
                
                {!importPreview ? (
                  <label className="admin-button flex items-center gap-2 w-full justify-center cursor-pointer">
                    <Upload className="w-4 h-4" />
                    Выбрать файл для импорта
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-admin-bg p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">Предпросмотр импорта</h3>
                      <pre className="text-sm text-gray-400 whitespace-pre-wrap">{importPreview}</pre>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleImport}
                        disabled={importing}
                        className="admin-button flex-1"
                      >
                        {importing ? 'Импорт...' : 'Подтвердить импорт'}
                      </button>
                      <button
                        onClick={handleCancelImport}
                        disabled={importing}
                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex-1"
                      >
                        Отмена
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Image Upload Section */}
          <div className="admin-card">
            <button
              onClick={() => toggleSection('imageUpload')}
              className="w-full flex items-center justify-between p-4 hover:bg-admin-bg/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Image className="w-6 h-6 text-admin-primary" />
                <h2 className="text-xl font-semibold">Загрузка изображений</h2>
              </div>
              {activeSection === 'imageUpload' ? <ChevronUp /> : <ChevronDown />}
            </button>
            
            {activeSection === 'imageUpload' && (
              <div className="p-4 pt-0 space-y-4">
                <p className="text-gray-400">Загрузите портретные изображения для НПС. Изображения будут сохранены в Firebase Storage.</p>
                
                {/* NPC Selection */}
                <div className="space-y-4">
                  <div className="relative" ref={dropdownRef}>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Поиск или выбор НПС
                    </label>
                    <div className="relative">
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={npcSearchTerm}
                        onChange={(e) => {
                          setNpcSearchTerm(e.target.value);
                          setShowNpcDropdown(true);
                        }}
                        onFocus={() => setShowNpcDropdown(true)}
                        placeholder={loadingNPCs ? "Загрузка НПС..." : "Поиск по имени, классу или ID..."}
                        className="w-full px-10 py-2 bg-admin-bg border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-admin-primary"
                        disabled={imageUpload.uploading || loadingNPCs}
                      />
                      <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                      {npcSearchTerm && (
                        <button
                          onClick={() => {
                            setNpcSearchTerm('');
                            setImageUpload(prev => ({ ...prev, selectedNpcId: undefined, npcId: '', isNewNpc: false }));
                          }}
                          className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    
                    {/* Selected NPC Display */}
                    {imageUpload.selectedNpcId && !imageUpload.isNewNpc && (
                      <div className="mt-2 px-3 py-2 bg-admin-bg/50 border border-admin-primary/50 rounded-md">
                        <p className="text-sm text-admin-primary">
                          Выбрано: {existingNPCs.find(n => n.id === imageUpload.selectedNpcId)?.name} ({imageUpload.selectedNpcId})
                        </p>
                      </div>
                    )}
                    
                    {/* Dropdown */}
                    {showNpcDropdown && (npcSearchTerm || !imageUpload.selectedNpcId) && (
                      <div className="absolute z-10 w-full mt-1 bg-admin-bg border border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {loadingNPCs ? (
                          <div className="px-4 py-3 text-gray-400">Загрузка НПС...</div>
                        ) : (
                          <>
                            {/* Create New NPC Option */}
                            <button
                              onClick={() => {
                                handleNPCSelection('new');
                                setShowNpcDropdown(false);
                                setNpcSearchTerm('');
                              }}
                              className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors flex items-center gap-2"
                            >
                              <Plus className="w-4 h-4 text-admin-primary" />
                              <span className="text-admin-primary font-medium">Создать нового НПС</span>
                            </button>
                            
                            {filteredNPCs.length > 0 && (
                              <div className="border-t border-gray-700">
                                {filteredNPCs.map(npc => (
                                  <button
                                    key={npc.id}
                                    onClick={() => {
                                      handleNPCSelection(npc.id);
                                      setNpcSearchTerm(npc.name);
                                      setShowNpcDropdown(false);
                                    }}
                                    className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium">{npc.name}</span>
                                      <span className="text-xs text-gray-400">({npc.class})</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1 font-mono">{npc.id}</p>
                                  </button>
                                ))}
                              </div>
                            )}
                            
                            {npcSearchTerm && filteredNPCs.length === 0 && (
                              <div className="px-4 py-3 text-gray-400 text-sm">
                                Не найдено НПС, соответствующих "{npcSearchTerm}"
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {imageUpload.isNewNpc && (
                    <div className="bg-admin-bg/50 p-4 rounded-lg border border-gray-600 space-y-3">
                      <div className="flex items-center gap-2 text-admin-primary">
                        <Plus className="w-4 h-4" />
                        <span className="font-medium">Данные нового НПС</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Имя НПС
                          </label>
                          <input
                            type="text"
                            value={imageUpload.newNpcName || ''}
                            onChange={(e) => handleNewNPCNameChange(e.target.value)}
                            placeholder="напр., Боб Торговец"
                            className="w-full px-3 py-2 bg-admin-bg border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-admin-primary"
                            disabled={imageUpload.uploading}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Класс НПС
                          </label>
                          <select
                            value={imageUpload.newNpcClass || ''}
                            onChange={(e) => handleNewNPCClassChange(e.target.value as NPCClass)}
                            className="w-full px-3 py-2 bg-admin-bg border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-admin-primary"
                            disabled={imageUpload.uploading}
                          >
                            <option value="">Выберите класс...</option>
                            {npcClasses.map(cls => (
                              <option key={cls} value={cls}>
                                {cls.charAt(0).toUpperCase() + cls.slice(1).replace('_', ' ')}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Generated/Selected NPC ID */}
                  {imageUpload.npcId && !imageUpload.npcSaved && (
                    <div className="bg-green-900/20 border border-green-600/50 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-400" />
                        <span className="text-sm font-medium text-green-400">
                          {imageUpload.isNewNpc ? 'Сгенерированный' : 'Выбранный'} ID НПС:
                        </span>
                        <code className="text-white bg-admin-bg px-2 py-1 rounded text-sm">{imageUpload.npcId}</code>
                      </div>
                      {imageUpload.isNewNpc && (
                        <p className="text-xs text-gray-400 mt-1">
                          Этот ID будет использоваться для организации изображений. Уникальный Firebase ID будет создан при создании НПС.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Image Upload Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Neutral Portrait */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Нейтральный портрет
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={(e) => handleImageSelect('neutral', e.target.files?.[0])}
                        className="hidden"
                        id="neutral-image"
                        disabled={imageUpload.uploading}
                      />
                      <label
                        htmlFor="neutral-image"
                        className={`block w-full px-3 py-2 bg-admin-bg border rounded-md hover:bg-gray-700 cursor-pointer transition-colors text-center ${
                          imageUpload.neutral ? 'border-green-600 text-green-400' : 'border-gray-600 text-gray-400'
                        }`}
                      >
                        {imageUpload.neutral ? `✓ ${imageUpload.neutral.name}` : 'Выбрать файл'}
                      </label>
                      {imageUpload.neutral && (
                        <button
                          onClick={() => handleImageSelect('neutral', undefined)}
                          className="absolute right-2 top-2 text-gray-400 hover:text-white"
                          disabled={imageUpload.uploading}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Positive Portrait */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Позитивный портрет
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={(e) => handleImageSelect('positive', e.target.files?.[0])}
                        className="hidden"
                        id="positive-image"
                        disabled={imageUpload.uploading}
                      />
                      <label
                        htmlFor="positive-image"
                        className={`block w-full px-3 py-2 bg-admin-bg border rounded-md hover:bg-gray-700 cursor-pointer transition-colors text-center ${
                          imageUpload.positive ? 'border-green-600 text-green-400' : 'border-gray-600 text-gray-400'
                        }`}
                      >
                        {imageUpload.positive ? `✓ ${imageUpload.positive.name}` : 'Выбрать файл'}
                      </label>
                      {imageUpload.positive && (
                        <button
                          onClick={() => handleImageSelect('positive', undefined)}
                          className="absolute right-2 top-2 text-gray-400 hover:text-white"
                          disabled={imageUpload.uploading}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Negative Portrait */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Негативный портрет
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={(e) => handleImageSelect('negative', e.target.files?.[0])}
                        className="hidden"
                        id="negative-image"
                        disabled={imageUpload.uploading}
                      />
                      <label
                        htmlFor="negative-image"
                        className={`block w-full px-3 py-2 bg-admin-bg border rounded-md hover:bg-gray-700 cursor-pointer transition-colors text-center ${
                          imageUpload.negative ? 'border-green-600 text-green-400' : 'border-gray-600 text-gray-400'
                        }`}
                      >
                        {imageUpload.negative ? `✓ ${imageUpload.negative.name}` : 'Выбрать файл'}
                      </label>
                      {imageUpload.negative && (
                        <button
                          onClick={() => handleImageSelect('negative', undefined)}
                          className="absolute right-2 top-2 text-gray-400 hover:text-white"
                          disabled={imageUpload.uploading}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {imageUpload.error && (
                  <div className="bg-red-900/20 border border-red-600/50 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                      <p className="text-red-400 text-sm">{imageUpload.error}</p>
                    </div>
                  </div>
                )}

                {/* Success Message */}
                {imageUpload.success && (
                  <div className="bg-green-900/20 border border-green-600/50 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <p className="text-green-400 text-sm">{imageUpload.success}</p>
                    </div>
                  </div>
                )}

                {/* Upload Button */}
                {!imageUpload.npcSaved && (
                  <button
                    onClick={handleUploadImages}
                    disabled={imageUpload.uploading || (!imageUpload.neutral && !imageUpload.positive && !imageUpload.negative)}
                    className="admin-button w-full"
                  >
                    {imageUpload.uploading ? 'Загрузка и сохранение...' : imageUpload.isNewNpc ? 'Загрузить изображения и создать НПС' : 'Загрузить изображения и обновить НПС'}
                  </button>
                )}

                {/* Success Message with URLs */}
                {imageUpload.uploadedUrls && imageUpload.npcSaved && (
                  <div className="bg-green-900/20 border border-green-600/50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <h4 className="font-semibold text-green-400">НПС успешно сохранён!</h4>
                      </div>
                      <button
                        onClick={resetImageUpload}
                        className="text-gray-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    {imageUpload.isNewNpc ? (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-300">
                          Создан новый НПС: <span className="font-semibold">{imageUpload.newNpcName}</span>
                        </p>
                        <p className="text-sm text-gray-300">
                          ID НПС: <span className="font-mono bg-admin-bg px-2 py-1 rounded">{imageUpload.npcId}</span>
                        </p>
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => router.push(`/npcs/edit?id=${imageUpload.npcId}`)}
                            className="text-admin-primary hover:underline text-sm"
                          >
                            Редактировать данные НПС →
                          </button>
                          <span className="text-gray-500">|</span>
                          <button
                            onClick={() => router.push('/npcs')}
                            className="text-admin-primary hover:underline text-sm"
                          >
                            Просмотреть все НПС →
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-300">
                          Обновлены портреты НПС: <span className="font-semibold">{existingNPCs.find(n => n.id === imageUpload.selectedNpcId)?.name}</span>
                        </p>
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => router.push(`/npcs/edit?id=${imageUpload.selectedNpcId}`)}
                            className="text-admin-primary hover:underline text-sm"
                          >
                            Просмотреть НПС →
                          </button>
                        </div>
                      </div>
                    )}
                    <div className="border-t border-gray-700 pt-3 space-y-2">
                      <p className="text-xs text-gray-400 font-medium">Ссылки на загруженные изображения:</p>
                      {imageUpload.uploadedUrls.neutral && (
                        <div className="bg-admin-bg p-2 rounded">
                          <p className="text-xs text-gray-400 mb-1">Нейтральное:</p>
                          <input
                            type="text"
                            value={imageUpload.uploadedUrls.neutral}
                            readOnly
                            className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs font-mono text-gray-300"
                            onClick={(e) => e.currentTarget.select()}
                          />
                        </div>
                      )}
                      {imageUpload.uploadedUrls.positive && (
                        <div className="bg-admin-bg p-2 rounded">
                          <p className="text-xs text-gray-400 mb-1">Позитивное:</p>
                          <input
                            type="text"
                            value={imageUpload.uploadedUrls.positive}
                            readOnly
                            className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs font-mono text-gray-300"
                            onClick={(e) => e.currentTarget.select()}
                          />
                        </div>
                      )}
                      {imageUpload.uploadedUrls.negative && (
                        <div className="bg-admin-bg p-2 rounded">
                          <p className="text-xs text-gray-400 mb-1">Негативное:</p>
                          <input
                            type="text"
                            value={imageUpload.uploadedUrls.negative}
                            readOnly
                            className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs font-mono text-gray-300"
                            onClick={(e) => e.currentTarget.select()}
                          />
                        </div>
                      )}
                    </div>
                    <button
                      onClick={resetImageUpload}
                      className="w-full px-4 py-2 bg-admin-primary text-white rounded-md hover:bg-admin-primary/90 transition-colors mt-3"
                    >
                      Загрузить ещё изображения
                    </button>
                  </div>
                )}

                {/* Instructions */}
                <div className="bg-admin-bg p-3 rounded-lg space-y-2">
                  <p className="text-xs text-gray-400">
                    <strong>Требования к изображениям:</strong> Максимальный размер файла 5МБ. Поддерживаемые форматы: JPEG, PNG, WebP.
                  </p>
                  <p className="text-xs text-gray-400">
                    <strong>Формат ID НПС:</strong> Принимает Firebase ID (напр., "bY0WTSIDpfNbR7TzLqQ9") или читаемый формат "класс_имя" (напр., "merchant_bob", "dragon_fire").
                  </p>
                  <p className="text-xs text-gray-400">
                    <strong>Использование:</strong> {imageUpload.isNewNpc ? 
                      'Выбор "Создать нового НПС" автоматически создаст НПС с загруженными изображениями.' : 
                      'Выбор существующего НПС автоматически обновит его портреты загруженными изображениями.'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Template Section */}
          <div className="admin-card">
            <button
              onClick={() => toggleSection('template')}
              className="w-full flex items-center justify-between p-4 hover:bg-admin-bg/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Code className="w-6 h-6 text-admin-primary" />
                <h2 className="text-xl font-semibold">Шаблон импорта</h2>
              </div>
              {activeSection === 'template' ? <ChevronUp /> : <ChevronDown />}
            </button>
            
            {activeSection === 'template' && (
              <div className="p-4 pt-0">
                <p className="text-gray-400 mb-4">Используйте этот шаблон для создания файлов импорта. Все показанные поля обязательны.</p>
                <pre className="bg-admin-bg p-4 rounded-lg text-sm overflow-x-auto">
{`{
  "npcs": [
    {
      "id": "merchant_bob",
      "name": "Bob the Merchant",
      "class": "merchant",
      "wealth": 3,
      "reliability": 85,
      "portraits": {
        "neutral": "https://firebasestorage.googleapis.com/v0/b/your-project.appspot.com/o/npcs%2Fmerchant_bob%2Fneutral.jpg?alt=media",
        "positive": "https://firebasestorage.googleapis.com/v0/b/your-project.appspot.com/o/npcs%2Fmerchant_bob%2Fpositive.jpg?alt=media",
        "negative": "https://firebasestorage.googleapis.com/v0/b/your-project.appspot.com/o/npcs%2Fmerchant_bob%2Fnegative.jpg?alt=media"
      },
      "description": "Странствующий торговец с экзотическими товарами"
    }
  ],
  "cards": [
    {
      "id": "merchant_deal",
      "type": "immediate",
      "category": "business",
      "npcId": "merchant_bob",
      "title": "Предложение торговца",
      "description": "У торговца есть деловое предложение",
      "situation": "Боб входит с улыбкой. 'У меня есть сделка, которая может быть выгодна нам обоим!'",
      "priority": 2,
      "options": [
        {
          "text": "Принять сделку",
          "consequences": {
            "money": 200,
            "reputation": 5
          }
        },
        {
          "text": "Договориться о лучших условиях",
          "consequences": {
            "money": 150,
            "reputation": 3,
            "passiveIncome": {
              "id": "merchant_partnership",
              "amount": 25,
              "description": "Партнёрство с торговцем",
              "remainingTurns": 10
            }
          }
        },
        {
          "text": "Вежливо отказаться",
          "consequences": {
            "money": 0,
            "reputation": 1
          }
        },
        {
          "text": "Грубо отказать",
          "consequences": {
            "money": 0,
            "reputation": -5,
            "npcRelationship": {
              "merchant_bob": -30
            }
          }
        }
      ],
      "requirements": {
        "minMoney": 100,
        "minReputation": -50,
        "flags": ["has_merchant_license"]
      }
    }
  ],
  "config": {
    "startingMoney": 10000,
    "startingReputation": 0,
    "baseIncome": 100,
    "baseCosts": 50,
    "scalingFormulas": {
      "moneyScaling": "turn * 1.05",
      "reputationImpact": "reputation * 0.01",
      "riskCalculation": "max(0, min(100, 50 - reputation))"
    },
    "version": "1.0.0"
  }
}`}
                </pre>
              </div>
            )}
          </div>

          {/* Content Creation Guide */}
          <div className="admin-card">
            <button
              onClick={() => toggleSection('guide')}
              className="w-full flex items-center justify-between p-4 hover:bg-admin-bg/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-admin-primary" />
                <h2 className="text-xl font-semibold">Руководство по созданию контента</h2>
              </div>
              {activeSection === 'guide' ? <ChevronUp /> : <ChevronDown />}
            </button>
            
            {activeSection === 'guide' && (
              <div className="p-4 pt-0 space-y-6">
                <div className="bg-yellow-900/20 border border-yellow-600/50 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <p className="text-yellow-400 text-sm">
                      <strong>Совет по ИИ-генерации:</strong> Каждая карта должна иметь ровно 4 варианта. Смешивайте положительные и отрицательные результаты. 
                      Включайте хотя бы один вариант, который позволяет избежать ситуации. Делайте последствия пропорциональными богатству НПС и приоритету карты.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-semibold text-admin-primary mb-2">Свойства НПС</h4>
                    <div className="bg-admin-bg p-3 rounded-lg space-y-2 text-sm">
                      <div>
                        <span className="text-gray-300 font-medium">Классы:</span>
                        <p className="text-gray-400">commoner, merchant, noble, adventurer, criminal, guard, cleric, mage, royal, crime_boss, dragon, bard, alchemist, dwarf, elf, halfling, orc, vampire, pirate, monk, witch, knight, necromancer, barbarian, artisan, scholar, blacksmith, hunter, sailor, healer, beggar, artist, official, mystic</p>
                      </div>
                      <div>
                        <span className="text-gray-300 font-medium">Богатство:</span>
                        <p className="text-gray-400">0-5 (0=нищий, 1=бедный, 2=скромный, 3=зажиточный, 4=богатый, 5=очень богатый)</p>
                      </div>
                      <div>
                        <span className="text-gray-300 font-medium">Надёжность:</span>
                        <p className="text-gray-400">0-100 (0=ненадёжный, 50=средняя, 100=надёжный)</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-admin-primary mb-2">Свойства карт</h4>
                    <div className="bg-admin-bg p-3 rounded-lg space-y-2 text-sm">
                      <div>
                        <span className="text-gray-300 font-medium">Типы:</span>
                        <p className="text-gray-400">immediate, passive_income, debt, social, modifier</p>
                      </div>
                      <div>
                        <span className="text-gray-300 font-medium">Категории:</span>
                        <p className="text-gray-400">service, business, entertainment, incident, legal, social, event, unusual, goods, crisis, information, illegal, decoration, upgrade, reputation, spiritual, magical, mystical, corruption, conflict</p>
                      </div>
                      <div>
                        <span className="text-gray-300 font-medium">Приоритет:</span>
                        <p className="text-gray-400">1 (обычный), 2 (необычный), 3 (редкий)</p>
                      </div>
                    </div>
                  </div>
                </div>

                <details className="bg-admin-bg rounded-lg">
                  <summary className="p-3 cursor-pointer hover:bg-admin-bg/50 font-medium">Справочник по вариантам последствий</summary>
                  <div className="p-3 pt-0">
                    <pre className="text-sm text-gray-400 overflow-x-auto">{`{
  "money": 100,                    // Прямое изменение денег
  "reputation": 5,                 // Прямое изменение репутации
  "passiveIncome": {              // Постоянный доход
    "id": "unique_income_id",
    "amount": 50,
    "description": "Источник дохода",
    "remainingTurns": 20
  },
  "debt": {                       // Долговое обязательство
    "id": "unique_debt_id",
    "principal": 1000,
    "totalAmount": 1200,
    "turnsRemaining": 20,
    "paymentPerTurn": 60,
    "creditorId": "npc_id",
    "collateral": "reputation"
  },
  "temporaryEffect": {            // Временный модификатор
    "id": "unique_effect_id",
    "type": "money_multiplier|reputation_boost|cost_reduction|risk_modifier",
    "value": 1.5,
    "turnsRemaining": 15,
    "description": "Описание эффекта"
  },
  "npcRelationship": {           // Изменение отношений с НПС
    "npc_id": 50                 // -100 до 100
  }
}`}</pre>
                  </div>
                </details>

                <details className="bg-admin-bg rounded-lg">
                  <summary className="p-3 cursor-pointer hover:bg-admin-bg/50 font-medium">Справочник по требованиям карт</summary>
                  <div className="p-3 pt-0">
                    <pre className="text-sm text-gray-400 overflow-x-auto">{`"requirements": {
  "minMoney": 1000,              // Минимально необходимые деньги
  "maxMoney": 50000,             // Максимально допустимые деньги
  "minReputation": -20,          // Минимальная репутация
  "maxReputation": 50,           // Максимальная репутация
  "flags": ["flag1", "flag2"],   // Требуемые игровые флаги
  "npcRelationships": {          // Требуемые отношения с НПС
    "npc_id": {
      "min": -50,
      "max": 100
    }
  }
}`}</pre>
                  </div>
                </details>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}