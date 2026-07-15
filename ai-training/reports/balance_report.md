# Class Balancing Report

## Distribution after cleaning
- **paper**: 2997
- **glass**: 1775
- **metal**: 1970
- **plastic**: 2381
- **mixed**: 2022
- **organic**: 1048
- **hazardous**: 55
- **textile**: 392

## Imbalance Mitigation Strategy
Because there is a natural imbalance in the data, the PyTorch `WeightedRandomSampler` will be used in `train.py` to ensure each batch sees an equal probability of each class.
