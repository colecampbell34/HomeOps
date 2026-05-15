import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { EmptyState } from '../../src/components/EmptyState';
import { RoomFormModal, roomOptions } from '../../src/components/RoomFormModal';
import { Screen } from '../../src/components/Screen';
import { useHomeOps } from '../../src/store/HomeOpsContext';
import { colors, font, radii, spacing } from '../../src/theme';
import { CreateRoomInput } from '../../src/types';

type RoomTemplate = {
  label: string;
  rooms: CreateRoomInput[];
};

const commonRoomTemplates: RoomTemplate[] = [
  {
    label: 'Starter home',
    rooms: [
      roomInput('Kitchen', 'kitchen'),
      roomInput('Bathroom', 'bathroom'),
      roomInput('Laundry', 'laundry'),
      roomInput('Garage', 'garage'),
      roomInput('Exterior', 'exterior'),
      roomInput('HVAC / Utility', 'hvac'),
    ],
  },
  {
    label: 'Apartment',
    rooms: [
      roomInput('Kitchen', 'kitchen'),
      roomInput('Bathroom', 'bathroom'),
      roomInput('Bedroom', 'bedroom'),
      roomInput('Laundry', 'laundry'),
      roomInput('Storage', 'custom'),
    ],
  },
  {
    label: 'Whole property',
    rooms: [
      roomInput('Kitchen', 'kitchen'),
      roomInput('Bathrooms', 'bathroom'),
      roomInput('Bedrooms', 'bedroom'),
      roomInput('Laundry', 'laundry'),
      roomInput('Garage', 'garage'),
      roomInput('Basement', 'basement'),
      roomInput('Exterior', 'exterior'),
      roomInput('HVAC / Utility', 'hvac'),
    ],
  },
];

export default function RoomsScreen() {
  const router = useRouter();
  const { addRoom, appliances, rooms, supplies, tasks } = useHomeOps();
  const [isRoomFormOpen, setIsRoomFormOpen] = useState(false);
  const [selectedTemplateLabel, setSelectedTemplateLabel] = useState<string | undefined>();
  const [addingSuggestedRoom, setAddingSuggestedRoom] = useState<string | undefined>();

  const selectedTemplate = commonRoomTemplates.find((template) => template.label === selectedTemplateLabel);

  async function handleAddSuggestedRoom(input: CreateRoomInput) {
    if (addingSuggestedRoom) {
      return;
    }

    const existingNames = new Set(rooms.map((room) => room.name.trim().toLowerCase()));
    if (existingNames.has(input.name.trim().toLowerCase())) {
      return;
    }

    setAddingSuggestedRoom(input.name);

    try {
      await addRoom(input);
    } finally {
      setAddingSuggestedRoom(undefined);
    }
  }

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Rooms</Text>
          <Text style={styles.subtitle}>Create areas and link tasks, appliances, and supplies by location.</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add room"
          onPress={() => setIsRoomFormOpen(true)}
          style={styles.addButton}
        >
          <Ionicons name="add" size={17} color={colors.white} />
          <Text style={styles.addButtonText}>Add</Text>
        </Pressable>
      </View>

      {rooms.length === 0 ? (
        <>
          <EmptyState
            icon="grid-outline"
            title="No rooms yet"
            body="Add rooms or areas like Kitchen, Garage, Basement, Exterior, or HVAC / Utility so tasks and supplies are easier to find."
            actionLabel="Add room"
            onAction={() => setIsRoomFormOpen(true)}
          />
          <TemplatePanel selectedLabel={selectedTemplateLabel} onSelectTemplate={setSelectedTemplateLabel} />
          {!!selectedTemplate && (
            <SuggestedRoomsPanel
              addingRoomName={addingSuggestedRoom}
              existingRoomNames={rooms.map((room) => room.name)}
              template={selectedTemplate}
              onAddRoom={handleAddSuggestedRoom}
            />
          )}
        </>
      ) : (
        <>
          <TemplatePanel selectedLabel={selectedTemplateLabel} onSelectTemplate={setSelectedTemplateLabel} />
          {!!selectedTemplate && (
            <SuggestedRoomsPanel
              addingRoomName={addingSuggestedRoom}
              existingRoomNames={rooms.map((room) => room.name)}
              template={selectedTemplate}
              onAddRoom={handleAddSuggestedRoom}
            />
          )}
          {rooms.map((room) => {
            const taskCount = tasks.filter((task) => task.roomId === room.id).length;
            const applianceCount = appliances.filter((appliance) => appliance.roomId === room.id).length;
            const supplyCount = supplies.filter((supply) => supply.roomId === room.id).length;

            return (
              <Pressable
                key={room.id}
                accessibilityRole="button"
                accessibilityLabel={`Open ${room.name}`}
                onPress={() => router.push(`/room/${room.id}`)}
                style={({ pressed }) => [styles.roomRow, pressed && styles.roomRowPressed]}
              >
                <View style={styles.roomIcon}>
                  <Ionicons name={room.icon as keyof typeof Ionicons.glyphMap} size={21} color={colors.primary} />
                </View>
                <View style={styles.roomText}>
                  <Text style={styles.roomTitle}>{room.name}</Text>
                  <Text style={styles.roomMeta}>
                    {taskCount} tasks · {applianceCount} appliances · {supplyCount} direct supplies
                  </Text>
                  {!!room.notes && (
                    <Text style={styles.roomNotes} numberOfLines={2}>
                      {room.notes}
                    </Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </Pressable>
            );
          })}
        </>
      )}

      <RoomFormModal visible={isRoomFormOpen} onClose={() => setIsRoomFormOpen(false)} onSubmit={addRoom} />
    </Screen>
  );
}

function roomInput(name: string, type: string): CreateRoomInput {
  const option = roomOptions.find((candidate) => candidate.type === type) ?? roomOptions[roomOptions.length - 1];

  return {
    name,
    type: option.type,
    icon: option.icon,
  };
}

function TemplatePanel({
  selectedLabel,
  onSelectTemplate,
}: {
  selectedLabel?: string;
  onSelectTemplate: (label: string) => void;
}) {
  return (
    <View style={styles.templatePanel}>
      <Text style={styles.templateTitle}>Common setups</Text>
      <View style={styles.templateRow}>
        {commonRoomTemplates.map((template) => (
          <Pressable
            key={template.label}
            accessibilityRole="button"
            accessibilityLabel={`Preview ${template.label} rooms`}
            onPress={() => onSelectTemplate(template.label)}
            style={({ pressed }) => [
              styles.templateButton,
              selectedLabel === template.label && styles.templateButtonSelected,
              pressed && styles.templateButtonPressed,
            ]}
          >
            <Text style={[styles.templateButtonText, selectedLabel === template.label && styles.templateButtonTextSelected]}>
              {template.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function SuggestedRoomsPanel({
  addingRoomName,
  existingRoomNames,
  template,
  onAddRoom,
}: {
  addingRoomName?: string;
  existingRoomNames: string[];
  template: RoomTemplate;
  onAddRoom: (room: CreateRoomInput) => void;
}) {
  const existingNameSet = new Set(existingRoomNames.map((name) => name.trim().toLowerCase()));

  return (
    <View style={styles.suggestedPanel}>
      <View style={styles.suggestedHeader}>
        <Text style={styles.templateTitle}>{template.label} rooms</Text>
        <Text style={styles.suggestedMeta}>Pending suggestions</Text>
      </View>
      {template.rooms.map((room) => {
        const alreadyAdded = existingNameSet.has(room.name.trim().toLowerCase());
        const isAdding = addingRoomName === room.name;

        return (
          <View key={`${template.label}-${room.name}`} style={styles.suggestedRow}>
            <View style={styles.suggestedIcon}>
              <Ionicons name={room.icon as keyof typeof Ionicons.glyphMap} size={18} color={alreadyAdded ? colors.textMuted : colors.primary} />
            </View>
            <View style={styles.roomText}>
              <Text style={styles.roomTitle}>{room.name}</Text>
              <Text style={styles.roomMeta}>{alreadyAdded ? 'Already added' : 'Not added yet'}</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Add ${room.name}`}
              disabled={alreadyAdded || !!addingRoomName}
              onPress={() => onAddRoom(room)}
              style={({ pressed }) => [
                styles.suggestedAddButton,
                alreadyAdded && styles.suggestedAddButtonMuted,
                pressed && styles.templateButtonPressed,
              ]}
            >
              <Text style={[styles.suggestedAddText, alreadyAdded && styles.suggestedAddTextMuted]}>
                {alreadyAdded ? 'Added' : isAdding ? 'Adding' : 'Add'}
              </Text>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  headerText: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    color: colors.text,
    fontSize: font.title,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: font.body,
    lineHeight: 21,
  },
  addButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    minHeight: 42,
    paddingHorizontal: spacing.md,
  },
  addButtonText: {
    color: colors.white,
    fontSize: font.small,
    fontWeight: '800',
  },
  roomRow: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 72,
    padding: spacing.lg,
  },
  roomRowPressed: {
    backgroundColor: colors.surfaceMuted,
  },
  roomIcon: {
    alignItems: 'center',
    backgroundColor: colors.greenSurface,
    borderRadius: radii.md,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  roomText: {
    flex: 1,
    gap: spacing.xs,
  },
  roomTitle: {
    color: colors.text,
    fontSize: font.body,
    fontWeight: '800',
  },
  roomMeta: {
    color: colors.textMuted,
    fontSize: font.small,
  },
  roomNotes: {
    color: colors.textMuted,
    fontSize: font.small,
    lineHeight: 18,
  },
  templatePanel: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  templateTitle: {
    color: colors.text,
    fontSize: font.body,
    fontWeight: '800',
  },
  templateRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  templateButton: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: radii.sm,
    borderWidth: 1,
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  templateButtonPressed: {
    backgroundColor: colors.surfaceMuted,
  },
  templateButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  templateButtonText: {
    color: colors.primary,
    fontSize: font.small,
    fontWeight: '800',
  },
  templateButtonTextSelected: {
    color: colors.white,
  },
  suggestedPanel: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  suggestedHeader: {
    gap: spacing.xs,
  },
  suggestedMeta: {
    color: colors.textMuted,
    fontSize: font.small,
  },
  suggestedRow: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 58,
    padding: spacing.md,
  },
  suggestedIcon: {
    alignItems: 'center',
    backgroundColor: colors.greenSurface,
    borderRadius: radii.sm,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  suggestedAddButton: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: radii.sm,
    borderWidth: 1,
    minHeight: 34,
    justifyContent: 'center',
    minWidth: 58,
    paddingHorizontal: spacing.md,
  },
  suggestedAddButtonMuted: {
    backgroundColor: colors.surfaceMuted,
  },
  suggestedAddText: {
    color: colors.primary,
    fontSize: font.small,
    fontWeight: '800',
  },
  suggestedAddTextMuted: {
    color: colors.textMuted,
  },
});
