import {
    Button,
    Select,
    Stack,
    TextContainer,
    TextField,
} from '@shopify/polaris'
import { DeleteMinor } from '@shopify/polaris-icons'

export type Connective = `AND` | `OR`
export type Modifier = `` | `-`
export type Comparator = `:` | `:<` | `:>` | `:<=` | `:>=`
export const Comparators = {
    EQUALS: `:` as Comparator,
    // Below will most likely not be used.
    LESS_THAN: `:<` as Comparator,
    GREATER_THAN: `:>` as Comparator,
    LESS_OR_EQUAL: `:<=` as Comparator,
    GREATER_OR_EQUAL: `:>=` as Comparator,
}

export interface Condition {
    modifier: Modifier
    field: keyof typeof FilterParams
    value: string
    valueInput: string
    filterName: string
    filterIndex: number
    filterComparator: Comparator
    applyFilter?: (value: string) => string
}

export interface Filter {
    name: string
    comparator: Comparator
    apply?: (value: string) => string
    index?: number
}

export const containsFilter: Filter = {
    name: 'contains',
    comparator: Comparators.EQUALS,
    apply: function (value: string) {
        if (value.indexOf('*') !== value.length - 1) {
            return `${value}*`
        } else {
            return `${value}`
        }
    },
}

export const isExactlyFilter: Filter = {
    name: 'is exactly',
    comparator: Comparators.EQUALS,
    apply: function (value: string) {
        if (
            value.indexOf('*') > -1 &&
            value.indexOf('*') === value.length - 1
        ) {
            return `${value.slice(0, value.length - 1)}`
        } else {
            return `${value}`
        }
    },
}

// Define filter availability for field types
export const FilterParams = {
    title: {
        name: 'Title',
        filters: [containsFilter, isExactlyFilter],
    },
    product_type: {
        name: 'Product Type',
        filters: [containsFilter, isExactlyFilter],
    },
    tag: {
        name: 'Tags',
        filters: [containsFilter],
    },
    vendor: {
        name: 'Vendor',
        filters: [containsFilter, isExactlyFilter],
    },
}

interface ProductFilterConditionsProps {
    conditions: Condition[]
    handleFieldChange: (value: string, id: string) => void
    handleConditionChange: (value: string, id: string) => void
    handleValueChange: (value: string, id: string) => void
    handleDeleteCondition: (value: string) => void
    handleAddCondition: () => void
}

/**
 * Select dropdown component that renders Shopify collections as options.
 *
 * @param {ProductFilterConditionsProps} {conditions, handleSelectChange, selectedCollection}
 * @returns {*}
 */
export const ProductFilterConditions = ({
    conditions,
    handleFieldChange,
    handleConditionChange,
    handleValueChange,
    handleDeleteCondition,
    handleAddCondition,
}: ProductFilterConditionsProps) => {
    const FieldOptions = Object.keys(FilterParams).map((field) => {
        const fieldKey = field as keyof typeof FilterParams
        return {
            label: FilterParams[fieldKey].name,
            value: field,
        }
    })

    function getConditionsOptions(condition: Condition) {
        return FilterParams[condition.field].filters.map((filter, index) => {
            return {
                label: filter.name,
                value: index.toString(),
            }
        })
    }

    const conditionsMarkup = conditions.map((condition, index) => {
        const conditionIndex = index.toString()
        const selectedFilterIndex = FilterParams[condition.field].filters
            .findIndex((filter) => {
                return filter.name === condition.filterName
            })
            .toString()

        const deleteButton =
            conditions.length === 1 ? (
                ''
            ) : (
                <Button
                    icon={DeleteMinor}
                    onClick={() => handleDeleteCondition(conditionIndex)}
                />
            )

        return (
            <TextContainer key={index}>
                <Stack distribution="equalSpacing">
                    <Stack.Item>
                        <div className=" min-w-[15rem]">
                            <Select
                                label=""
                                onChange={(value) =>
                                    handleFieldChange(value, conditionIndex)
                                }
                                options={FieldOptions}
                                value={condition.field}
                            />
                        </div>
                    </Stack.Item>
                    <Stack.Item>
                        <div className=" min-w-[10rem]">
                            <Select
                                label=""
                                onChange={(value) =>
                                    handleConditionChange(value, conditionIndex)
                                }
                                options={getConditionsOptions(condition)}
                                value={selectedFilterIndex}
                            />
                        </div>
                    </Stack.Item>
                    <Stack.Item fill>
                        <TextField
                            label=""
                            onChange={(value) =>
                                handleValueChange(value, conditionIndex)
                            }
                            value={condition.valueInput}
                            autoComplete="off"
                        />
                    </Stack.Item>
                    <Stack.Item>{deleteButton}</Stack.Item>
                </Stack>
            </TextContainer>
        )
    })

    const addConditionButton =
        conditions.length > 10 ? (
            ''
        ) : (
            <Button onClick={handleAddCondition}>Add another condition</Button>
        )

    return (
        <TextContainer>
            {conditionsMarkup}
            {addConditionButton}
        </TextContainer>
    )
}
